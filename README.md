# User API

This API currently is:
- ⚙️ Under active development.
- 🌐 Intended for internal use only.

## Base URL

[https://user-api-352594405825.asia-southeast2.run.app](https://user-api-352594405825.asia-southeast2.run.app)

## Endpoints

Send your request body in JSON.

### POST `/auth/register`

The endpoint to register a new user.

```json
// request body in JSON
{
  "email": "cobadigmeet@example.com",
  "password": "ininyobake101",
  "name": "futuratec-242",
  "uname": "futurate242"
}
```
### POST `/auth/register` response
The endpoint response from register a new user.

```json
// request body in JSON
{
    "message": "User registered successfully",
    "uid": "v4uJssL7ZGZ9BvTImr59HTWHDOs1"
}
```

If you register with the same username or email, the response will look like this
```json
// request body in JSON
{
    "message": "User registered successfully",
    "uid": "v4uJssL7ZGZ9BvTImr59HTWHDOs1"
}
```

### POST `/auth/login`

The endpoint to user login.

```json
// request body in JSON
{
  "email": "futurate__@example.com",
  "password": "Futuratee"
}
```

### POST `/auth/login` response
If you login with the true email and password, the response will look like this.
```json
// request body in JSON
{
    "message": "Login successful",
    "user": {
        "uname": "futurate.c242",
        "email": "futurate__@example.com",
        "password": "$2b$10$hSqo4TJx4TGacf67RC4HQ.pV/54DXYsFlmxYhJEUD8khIknZ7PU2C",
        "createdAt": {
            "seconds": 1734030106,
            "nanoseconds": 642000000
        },
        "name": "futurate-c242"
    }
}
```
If you input the wrong email or password, the output will look like this.
```json
{
    "error": "Invalid credentials"
}
```
Thats mean you failed to login into application.
