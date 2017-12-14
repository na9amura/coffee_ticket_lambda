FROM node:alpine

RUN apk update
RUN apk upgrade
RUN apk add --no-cache --update \
  python3 \
  groff \
  less \
  mailcap \
  curl \
  unzip \
  git \
  bash \
  openjdk7-jre

RUN python3 -m ensurepip && \
  rm -r /usr/lib/python*/ensurepip

RUN pip3 install --upgrade \
 pip \
 setuptools \
 awscli

RUN \
  npm install -g serverless && \
  npm install aws-sdk && \
  npm install --save-dev \
    serverless-offline \
    serverless-dynamodb-local

RUN apk -v --purge del py-pip && \
  rm /var/cache/apk/*

EXPOSE 3001 8001
# RUN serverless dynamodb install
