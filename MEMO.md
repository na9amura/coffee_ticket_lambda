# Memo
## docker-lambda
https://github.com/lambci/docker-lambda

### run default script
If you do not specify handler, run index.js
`docker run -v "$PWD":/var/task lambci/lambda`

### run specific script (with arguments)
You can specify handler using filename
`docker run -v "$PWD":/var/task lambci/lambda example.handler '{ 'some': 'args' }'`

### run with saved arguments
`docker run -v "$PWD":/var/task lambci/lambda example.handler $(printf '%s' $(cat input.json))`
