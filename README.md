pairr
=====

pairr is a proof of concept tool to receive and parse data from UBC pair. The idea is to provide a tool to facilitate a crowd sourced scrape of grade data. By directly intercepting emails from UBC, the data is already trusted and requires no further review.

## Example server
Because this is quite a pain to configure, there is an example running at [pairr.falkirks.com](http://pairr.falkirks.com). It is on Heroku, so it might take a few seconds to get started.

## Get started

```sh
git clone https://github.com/Falkirks/pairr
npm install
npm start
```

## Setup incoming email processing
pairr uses [mailgun](https://www.mailgun.com/) to receive emails. Create an account and setup your domain, then do the following.
* Set the env variable `MAILGUN_API_KEY` to your mailgun API key.
* Configure a route to store and notify all emails from `do_not_reply@oldadm.ubc.ca` to `yourdomain.com/mailgun`.

## Heroku
pairr will easily work with Heroku, just remember to configure the `MAILGUN_API_KEY` variable as above.
