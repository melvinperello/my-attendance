# my-attendance

## Multi-Platform Attendance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

my-attendance is a web based attendance tracker that can be deployed on multiple platforms with minimal configurations.

> Please keep in mind that my-attendance is still under development and full backward compatibility is not guaranteed before reaching v1.0.0.

> my-attendance follows **Semantic Versioning 2.0.0**

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

| Plugin                  | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| @fastify/jwt            | https://github.com/fastify/fastify-jwt                |
| @fastify/static         | https://github.com/fastify/fastify-static             |
| @fastify/view           | https://github.com/fastify/point-of-view              |
| @fastify/compress       | https://github.com/fastify/fastify-compress           |
| @fastify/compress       | https://github.com/fastify/fastify-compress           |
| platform-plugin         | Adds necessary configuration for the current platform |
| security-headers-plugin | Adds security headers to fastify responses            |

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

**Order of Environment Variables**

1. System - Any System Configured Variables Will not be overidden if it's already set.
2. .env - If system variables are not set .env files will be used.
3. Secrets Manager - any variables configured above will be overidden by the Secrets Manager. (This will take the highest priority)

**Configuration Variables**

| Variable       | README                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| MA_PLATFORM    | identifier of the host platform, valid values is only gcp                                                                                    |
| MA_TIMEZONE    | Please see list of available timezones [Timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) / defaults to "Asia/Taipei" |
| MA_SECRET_NAME | The name of the secret for security sensitive variables                                                                                      |

**Security Sensitive Variables**
These are stored in Secrets Manager

| Variable                   | README                                             |
| -------------------------- | -------------------------------------------------- |
| MA_SEC_PRIVATE_KEY         | private key as string used in generating JWT token |
| MA_SEC_PUBLIC_KEY          | public key as string used in validating JWT Token  |
| MA_SEC_PRIVATE_PHRASE_KEY  | phrase key for the JWT Private Key                 |
| MA_SEC_WEBPUSH_PRIVATE_KEY | VAPID Private Key                                  |
| MA_SEC_WEBPUSH_PUBLIC_KEY  | VAPID Public Key                                   |

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
