#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CodingEc2Stack } from '../lib/coding-ec2-stack';

const app = new cdk.App();
new CodingEc2Stack(app, 'CodingEc2Stack', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    }    
});