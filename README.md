# my-attendance

## Platform Agnostic Attendance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

my-attendance is a web based attendance tracker that can be deployed anyhwere,

## Features

- Provides Authenticator Access to every user.
- Allows attendance to be logged by the user.
- Report Generation for the Supervisor.

## Tech

my-attendance uses a number of open source projects to work properly:

- [Fastify](https://www.fastify.io/) - Fastify is a web framework highly focused on providing the best developer experience with the least overhead and a powerful plugin architecture, inspired by Hapi and Express.
- [ejs](https://ejs.co/) - EJS is a simple templating language that lets you generate HTML markup with plain JavaScript.
- [jQuery](https://jquery.com/) - jQuery is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.
- [Bootstrap](https://getbootstrap.com/) - Boostrap is a Powerful, extensible, and feature-packed frontend toolkit.

## Installation

my-attendance requires [node.js](https://nodejs.org/en/blog/release/v16.16.0/) v16.16+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd my-attendance
npm install
npm start
```

## Plugins

my-attendaance is currently extended with the following fastify plugins.
Instructions on how to use them in your own application are linked below.

| Plugin          | README                                            |
| --------------- | ------------------------------------------------- |
| @fastify/jwt    | [https://github.com/fastify/fastify-jwt][pldb]    |
| @fastify/static | [https://github.com/fastify/fastify-static][plgh] |
| @fastify/view   | [https://github.com/fastify/point-of-view][plgd]  |

## Roadmap

my-attendaance is currently in progress to work across different platforms.

| Platform                          | README    |
| --------------------------------- | --------- |
| Google Cloud Platform / Firestore | Completed |
| Amazon Web Services / Dynamo DB   | Planned   |
| Node / SQLite                     | Planned   |

## Development

Generate your JWT keys, please see this [post](https://stackoverflow.com/questions/40595895/how-can-i-generate-the-private-and-public-certificates-for-jwt-with-rs256-algori) as reference.

```sh
cd /cygdrive/c
openssl genrsa -aes256 -out private_key.pem 2048 openssl rsa -pubout -in private_key.pem -out public_key.pem
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

### Environment Variables

- **MA_PRIVATE_KEY** - private key as string used in generating JWT token.
- **MA_PUBLIC_KEY** - public key as string used in validating JWT Token.
- **MA_PHRASE_KEY** - phrase key for the private key.
- **MA_TIMEZONE** - the current time zone for attendance logging, defaults to Asia/Taipei.
- **MA_PLATFORM** - describes the current environment to apply necessary settings to run the application.

### Google Cloud Platform

Authenticate in you google cloud platform account

```sh
gcloud auth application-default login
gcloud auth application-default revoke
```

See additional resources for google cloud platform.

- https://www.npmjs.com/package/@google-cloud/firestore
- https://cloud.google.com/nodejs/docs/reference/firestore/latest
- https://cloud.google.com/docs/authentication/client-libraries
- https://cloud.google.com/docs/authentication/provide-credentials-adc

### Generate VAPID Keys

```sh
web-push generate-vapid-keys
```
