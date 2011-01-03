The application

Features
- Redirect in case not found and matching route with / without "/"
- Reverse lookups of URLs, avoids app breakage when mappings change
  - Optional named routes for reverse lookup
- Simple syntax for pattern matching
- Views are called as methods of applications. This means you can use:
  - this.reverse(...) etc.
