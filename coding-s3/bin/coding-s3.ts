#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CodingS3Stack } from '../lib/coding-s3-stack';

const app = new cdk.App();
new CodingS3Stack(app, 'CodingS3Stack');
