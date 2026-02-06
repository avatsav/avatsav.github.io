+++
title = "Goodbye Jetpack ViewModel? Hello retain!"
date = "2026-01-20"
slug = "hello-retain"
description = "Retain is here!"
+++

Compose 1.10 introduced the new `retain {}` API that has a different lifecycle to the `remember` and `rememberSaveable`. I recommend reading the excellent series of blog posts on it from GDE Jaewoong Eum.

- [Previewing retain{} API: A New Way to Persist State in Jetpack Compose](https://proandroiddev.com/exploring-retain-api-a-new-way-to-persist-state-in-jetpack-compose-bfb2fe2eae43)
- [Previewing RetainedEffect: A New Side Effect to Bridge Between Composition and Retention Lifecycles](https://skydoves.medium.com/previewing-retainedeffect-a-new-side-effect-to-bridge-between-composition-and-retention-lifecycles-685b9e543de7)
- [Understanding retain{} internals: A Scope-based State Preservation in Jetpack Compose](https://proandroiddev.com/understanding-retain-internals-a-new-way-to-preserve-state-in-jetpack-compose-54471a32fd05)

A retained valued can survive a configuration change without being serialized. This is exactly what the Jetpack ViewModel(from here on referred to as ViewModel) does!

So that got me thinking if we could take the android lifecycle handling out of the ViewModels and make them simple Kotlin class that does state management independent(from here on referred to as a Presenter). Turns out it is very much possible and simplifies a great many things!

Let's take the example of a simple ViewModel + Screen setup in Compose with Nav3 + Metro/Hilt

```kotlin
@HiltViewModel
class AuthViewModel(...): ViewModel() {
  val state: StateFlow<UiState>
  fun login(creds: Credentials) { .. }
  fun logout() { .. }
}

@Composable
fun AuthScreen(viewModel:AuthViewModel) {
  ..
}

typealias RouteEntryProviderScope = EntryProviderScope<Route>.() -> Unit

// Use this with NavDisplay!
@ContributesTo(UiScope::class)
interface AuthScreenProviders {
  @IntoSet
  @Provides
  fun provideAuthEntryProviderScope(): RouteEntryProviderScope = {
    entry<Route.Auth> { AuthScreen(viewModel = hiltViewModel()) }
  }
}
```

This might be all too familiar to you. What stands out to me is the special treatment required to create an instance of a ViewModel which involves a lot of plumbing. Most DI frameworks nowadays ship a separate ViewModel artifact to allow a ViewModel to be injectable. The `@HiltViewModel` annotations write a bunch of binding code to make the ViewModle `hiltViewModel()` is doing a lot of heavylifting here to find the

What if we could treat the ViewModel in a way that every other Koltin class without any special treatment? Turns out it is much simpler

```kotlin
@Inject
class AuthPresenter(...): ViewModel() {
  val state: StateFlow<UiState>
  fun login(creds: Credentials) { .. }
  fun logout() { .. }
}

@Composable
fun AuthScreen(presenter: AuthPresenter) {
  ..
}

@ContributesTo(UiScope::class)
interface AuthScreenProviders {
  @IntoSet
  @Provides
  fun provideAuthEntryProviderScope(presenter: Providert<AuthPresenter>): RouteEntryProviderScope = {
    entry<Route.Auth> { AuthScreen(presenter = retain { presenter() }) }
  }
}
```

No more special treatment. The retention of the presenter or any object on configuration change now becomes purely the choice of UI framework with the usage of `retain { }`.
Now you might ask, how the coroutines or scopes are cancelled when the retained value is retired? Well, there's a `RetainObserver` interface that allows you to observe when an object is retained and retired. This allows you to do some housekeeping on your Presenters when they are retied. It would looks something like this.

```kotlin
/** Retains a presenter and closes it when retired */
@Composable
inline fun <reified P : MoleculePresenter<*, *, *>> retainPresenter(
  noinline calculation: () -> P
): P {
  return retain { RetainedPresenterObserver(calculation()) }.value
}

class RetainedPresenterObserver<P : MoleculePresenter<*, *, *>>(val value: P) : RetainObserver {
  override fun onRetained() {}

  override fun onEnteredComposition() {}

  override fun onExitedComposition() {}

  override fun onRetired() {
    value.close()
  }

  override fun onUnused() {}
}
```

And now you can use your newly created method like so

```kotlin
  fun provideAuthEntryProviderScope(presenter: Provider<AuthPresenter>): RouteEntryProviderScope = {
    entry<Route.Auth> { AuthScreen(presenter = retainPresenter { presenter() }) }
  }
```
