module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"
  function_name = "my-lambda"
  description   = "My awesome lambda function"
  handler       = "index.lambda_handler"
  runtime       = "python3.8"
  source_path = "../src/lambda-function"
  tags = {
    Name = "my-lambda"
  }
}

module "ts_lambda_function" {
  source = "terraform-aws-modules/lambda/aws"
  function_name = "ts-my-lambda"
  description   = "My lambda function written in TS"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  source_path = [{
    path = "../src"
    commands = [
      "npm ci", # install dependencies
      "npm run build", # npx tsc to transpile
      "npm prune --production"
      ":zip" # zip all
    ]
  }]
  publish = true
  environment_variables = {
    ENV = "dev"
  }
  attach_policy_statements = true
  policy_statements = {
    cloud_watch = {
      effect    = "Allow",
      actions   = ["cloudwatch:PutMetricData"],
      resources = ["*"]
    }
  }
  tags = {
    Name = "ts-lambda"
  }
}