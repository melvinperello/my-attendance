https://www.npmjs.com/package/@google-cloud/firestore
https://cloud.google.com/nodejs/docs/reference/firestore/latest
https://cloud.google.com/docs/authentication/client-libraries
https://cloud.google.com/docs/authentication/provide-credentials-adc

gcloud auth application-default login
gcloud auth application-default revoke

https://stackoverflow.com/questions/40595895/how-can-i-generate-the-private-and-public-certificates-for-jwt-with-rs256-algori
cd /cygdrive/c
openssl genrsa -aes256 -out private_key.pem 2048 openssl rsa -pubout -in private_key.pem -out public_key.pem
openssl rsa -pubout -in private_key.pem -out public_key.pem
