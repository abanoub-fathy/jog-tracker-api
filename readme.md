# Jog Tracker: Rest API built with Nodejs, Express and MongoDB

The API purpose is to track jogging times of users.

### Quick Start

#### You will need to add the following environment variables

- `PORT` (This is the port which the server will listen to)
- `DATABASE_URL` (This is the URL of your Database)
- `TOKEN_SECRET` (This is the secret key for generating and decoding jsonwebtokens that used to authenticate the user)

## Running the App

**How to run**

1. Clone this repo `git clone https://github.com/abanoub-fathy/jog-tracker-api.git`
2. Go to the project directory `cd jog-tracker-api`
3. Install packages `npm install`
4. Set the three environment variables `PORT`, `DATABASE_URL` `TOKEN_SECRET`. one way to do that is to create .env file and set these environment variables inside it.
5. from the terminal run `npm run dev` or `npm run start`

## Permissions

The application has three level of permissions:

- **Normal users**: can CRUD on their owned records (account and jogs)
- **Manager users**: can CRUD users and their owned jogs. NOTE: Managers can't crude Admin users
- **Admin users**: can CRUD any users and jogs.

## Endpoints

The API exposes the following endpoints:

#### User related endpoints

- **[POST] /users/new/** - create new normal user.
- **[POST] /users/new/admin/** - create new admin user accessed by admin only.
- **[POST] /users/new/manager/** - create new manager user accessed by admin only.
- **[POST] /users/login/** - User login. The reponse contains an authentication token that will be further used to authenticate user's requests. The token expires after 24h.
- **[GET] /users/** - List users in the DB. this endpoint provide pagination by accepting two query params limit to limit the number of returned users and skip to skip number of users. this endpoint accessed by admin and user manager only. for this endpoint admin will see all users but the user manager can see only normal users.
- **[GET] /users/${id}/** - User retrieve. normal user can retrieve only its account. manager user can retrieve its account or normal users. admin user can retrieve any type of account.
- **[PATCH] /users/${id}/** - User update. normal user can upate only its account. manager user can upate its account or normal users accounts. admin user can update any type of account.
- **[DELETE] /users/${id}/** - User delete. normal user can delete only its account. manager user can delete its account or normal users. admin user can delete any type of account.
- **[POST] /users/logout/** - Sign out the existing user from the current device.
- **[POST] /users/logout/all/** - Sign out the existing user from the all device.

#### Jogs related endpoints

- **[POST] /jogs/** - Create new Jog. normal user can create jog for its account only. manager user can create jog for its account only. admin user can create jog for anyone.
- **[GET] /jogs/${id}/** - Jog retrieve. normal and manager users can retrieve only their jogs. admin user can retrieve any jog.
- **[PATCH] /jogs/${id}/** - Jog update. normal and manager users can update only their jogs. admin user can update any jog.
- **[DELETE] /jogs/${id}/** - Jog delete. normal and manager users can delete only their jogs. admin user can delete any jog.
- **[GET] /jogs/** - retrieve list of jogs from the DB. this endpoint provide pagination by accepting two query params limit to limit the number of returned jogs and skip to skip number of jogs. this endpoint accessed by admin users only.
- **[GET] /jogs/user/${id}** - retrieve list of jogs for specific user from the DB. this endpoint provide pagination by accepting two query params limit to limit the number of returned jogs and skip to skip number of jogs. also this endpoint provides filtering by accepting other two query params from and to to filter the jogs in specified period. also this endpoint provides sorting by accepting the sortBy query param. normal and manger users can retrieve only their jogs. admin can retrieve list of jogs for any kind of account.
- **[GET] /jogs/user/${id}/report/** - get a report for average speed and total distance in the last week for specific user. normal and mager user can get report for their account only. admin user can get report for any type of account.

## Pagination

- the API provides pagination for all endpoints that return a list of elements (**/users/**, **/jogs/**, **/jogs/user/${id}**)
- the default limit size is 5 and default skip is 0. To configure a diferent value, set a value for `limit` and `skip` query parameters for those endpoints.
- Each response contains a "total" field that represents the total number of entries (without being restricted by the `limit`)

## Filtering

- the API provides filter capabilities for the endpoint that returns list of specific user jogs (**/jogs/user/${id}/**) by accepting two query params `from` and `to`.

## Examples

#### User Registration Example

- user **POST** Method, and URL: **http://`URL`:`PORT`/users/new/**
- in Header section, add **content-type** **application/json**
- in Body section add the following json:

```
{
    "name": "bebo",
    "email": "bebo@gmail.com",
    "password": "mypass123"
}
```

if the required fields is entered with and valid. The respose status code will be 200. and yo will get json response with the user entered data plus the user id.

```
{
    "name": "bebo",
    "email": "bebo@gmail.com",
    "role": "normal",
    "_id": "62026961d1adfa7f6a952225",
    "__v": 0
}
```

#### User Login Example

- use **POST** Method, and URL: **http://`URL`:`PORT`/users/login/**
- in Header section, add **content-type** **application/json**
- in Body section add the following json:

```
{
    "email": "bebo@gmail.com",
    "password": "mypass123"
}
```

If the credentials are correct you will get the user info and token in the response. like this.

```
{
    "user": {
        "_id": "62026961d1adfa7f6a952225",
        "name": "bebo",
        "email": "bebo@gmail.com",
        "role": "normal",
        "__v": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjAyNjk2MWQxYWRmYTdmNmE5NTIyMjUiLCJpYXQiOjE2NDQzMjU3MzgsImV4cCI6MTY0NDQxMjEzOH0.P-X_lKRYdx6MyV0wGHNXXG6ji8aMW270ABZ186XFM5U"
}
```

- Save the authentication token received in the response, in order to authenticate the user for the following requests.

- Save the user id to be used for other requests.

#### Create Jog Example

- use **POST** Method, and URL: **http://`URL`:`PORT`/jogs/**
- in Header section, add **content-type** header name with **application/json** value and **Authorization** header name with **`Bearer ${Token}`** value (Note: don't forget the 'Bearer' word in front of the token)
- in Body section add the following json (NOTE: **date** has **YYYY-MM-DD** format):

```
{
    "date": "2022-02-08",
    "distance": 200,
    "time": 150,
    "location": "Cairo Stadim",
    "owner": "62026961d1adfa7f6a952225"
}

```

- Note that owner field should match exactly with id of the user (in this case we have normal user that can only create a jog for its account)

- The successful response will be the created jog

```
{
    "date": "2022-02-08T00:00:00.000Z",
    "distance": 200,
    "time": 150,
    "location": "Cairo Stadim",
    "owner": "62026961d1adfa7f6a952225",
    "_id": "62026e02d1adfa7f6a95222f",
    "__v": 0
}
```
