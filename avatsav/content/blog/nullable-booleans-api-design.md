+++
title = "The Boolean from hell"
date = "2025-01-15"
description = "Avoiding the Tri-State Trap"
tags = ["api-design"]
+++

One of my programming pet-peeves in API design is what I like to call, the boolean from hell. It defies it's own nature of a type that represents binary state and takes on an additional third state. A null.

Let's start with this example

```json
{
  "bookId": 57,
  "isPreorder": true,
  "isAvailable": true
}
```

Seems straightforward at first glance, but you start to notice something strange in your strongly typed client. You notice that there's a crash when trying to parse the `isAvailable` field as it is sometimes null. You change this your client code and mark the type as nullable(Boolean?). So, what does a null value mean in this case? 
- Is it an error state that it is null? Is the server misbehaving?
- Does it mean that it is unavailable since hte value is absent?
- Or shoild I make other assumptions that by default all books are available and if it's false then?
- Or does it mean that the availablilty is unknown? Is unknown a valid state?

Not only this, but you have to propogate this "derived" state defensively into the domain layer of your client(because you don't want to pass this "null" value all the way up the chain and defensively check the value in the UI) This opens up room for misinterrptataion. What seemed like a simple boolean turns something unintended.

State vs Intent
