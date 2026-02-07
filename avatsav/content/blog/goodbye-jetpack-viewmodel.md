+++
title = "Goodbye ViewModel. Hello retain!"
date = "2026-02-07"
slug = "hello-retain"
description = "Retain is here!"
tags = [
    "android-dev",
    "compose",
]
+++

Compose `1.10` introduced the new `retain` API that has a different lifecycle than `remember` and `rememberSaveable`. I recommend reading these excellent series of blog posts on it:

- [Previewing retain{} API: A New Way to Persist State in Jetpack Compose](https://proandroiddev.com/exploring-retain-api-a-new-way-to-persist-state-in-jetpack-compose-bfb2fe2eae43)
- [Previewing RetainedEffect: A New Side Effect to Bridge Between Composition and Retention Lifecycles](https://skydoves.medium.com/previewing-retainedeffect-a-new-side-effect-to-bridge-between-composition-and-retention-lifecycles-685b9e543de7)
- [Understanding retain{} internals: A Scope-based State Preservation in Jetpack Compose](https://proandroiddev.com/understanding-retain-internals-a-new-way-to-preserve-state-in-jetpack-compose-54471a32fd05)

A retained value can survive a configuration change without being serialized. This is exactly what Jetpack ViewModel does!

This got me thinking: what if we removed the Android lifecycle handling from ViewModels entirely? What if they were just plain Kotlin classes for state management? Turns out this is not only possible, it simplifies things considerably!

## The ViewModel Problem

Let's take the example of a simple ViewModel + Screen setup in Compose with Nav3 + Hilt:

```kotlin {hl_lines=[1,18]}
@HiltViewModel
@Inject
class AuthViewModel(...): ViewModel() {
  val state: StateFlow<UiState>
  fun login(creds: Credentials) { .. }
  fun logout() { .. }
}

@Composable
fun AuthScreen(viewModel: AuthViewModel) {
  ..
}

interface AuthScreenProviders {
  @IntoSet
  @Provides
  fun provideAuthEntryProviderScope(): RouteEntryProviderScope = {
    entry<Route.Auth> { AuthScreen(viewModel = hiltViewModel()) }
  }
}
```

This should look familiar. What stands out is the special treatment required to create a ViewModel instance. Most DI frameworks nowadays ship a separate ViewModel artifact to allow a ViewModel to be injectable. The `@HiltViewModel` annotation writes a bunch of binding code, and `hiltViewModel()` does a lot of heavy lifting and abstracts away the creation logic with the `ViewModelProvider.Factory`.

## A Simpler Approach

With `retain`, the configuration change survival becomes a UI concern and we can make our presenters plain Kotlin classes and injectable just like any other dependency. No more special treatment!

Here's what that looks like:

```kotlin {hl_lines=["11-13"]}
@Inject
class AuthPresenter(...) {
  val state: StateFlow<UiState>
  fun login(creds: Credentials) { .. }
  fun logout() { .. }
}

interface AuthScreenProviders {
  @IntoSet
  @Provides
  fun provideRoute(presenter: Provider<AuthPresenter>): RouteEntryProviderScope = {
    entry<Route.Auth> { AuthScreen(presenter = retain { presenter() }) }
  }
}
```

## Handling Cleanup

You might now ask: How do we clean up resources like coroutine scopes when the retained value is retired? The `RetainObserver` interface gives us lifecycle hooks for retained objects and we can use `onRetired()` to handle cleanup when the object is no longer needed.

Here's how that would look:

```kotlin {hl_lines=["18-20"]}
interface Presenter {
  fun close()
}

/** Retains a presenter and closes it when retired */
@Composable
inline fun <reified P : Presenter> retainPresenter(
  noinline calculation: () -> P
): P {
  return retain { RetainedPresenterObserver(calculation()) }.value
}

class RetainedPresenterObserver<P : Presenter>(val value: P) : RetainObserver {
  override fun onRetained() = Unit
  override fun onEnteredComposition() = Unit
  override fun onExitedComposition() = Unit
  override fun onUnused() = Unit
  override fun onRetired() {
    value.close()
  }
}
```

And now you can use it like this:

```kotlin {hl_lines=[3]}
fun provideRoute(presenter: Provider<AuthPresenter>): RouteEntryProviderScope = {
  entry<Route.Auth> {
    AuthScreen(presenter = retainPresenter { presenter() })
  }
}
```

## Navigation 3 Support

Similar to how ViewModel requires `ViewModelStoreNavEntryDecorator`, using `retain` requires a `RetainedValuesStoreNavEntryDecorator` which is [currently under development](https://android-review.googlesource.com/c/platform/frameworks/support/+/3904490) as of this writing. It'll likely ship as a `runtime-retain-navigation3` artifact soon.

This decorator provides a `RetainedValuesStore` for each backstack entry, allowing `retain` to respect navigation state. Retained values survive while the entry is in the backstack and get retired when the entry is removed.

## Wrapping Up

The `retain` API shifts configuration survival from a framework concern (ViewModel) to a UI concern. Our presenters become simpler. Just regular Kotlin classes that the UI layer chooses to retain. No need to extend ViewModel, no special DI setup.

I've been experimenting with this approach in my [playground project](https://github.com/avatsav/linkding-apps) if you want to see it in practice.

ViewModel still has its place, but for most cases, `retain` with simple presenters should get us the same benefits with less ceremony.
