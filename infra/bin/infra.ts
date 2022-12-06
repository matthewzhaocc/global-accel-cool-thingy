#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/infra-stack";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

const west = new BackendStack(app, "us-west-1-backend", {
  env: { region: "us-west-1" },
  crossRegionReferences: true,
});
const east = new BackendStack(app, "us-east-1-backend", {
  env: { region: "us-east-1" },
  crossRegionReferences: true,
});

new InfraStack(app, "InfraStack", {
  eastArn: east.lbArn,
  westArn: west.lbArn,
  env: {
    region: "us-east-1",
  },
  crossRegionReferences: true,
});


