import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class CodingEc2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const t2Micro = new ec2.InstanceType('t2.micro');

    const linuxAMI = new ec2.GenericLinuxImage({
      'ap-northeast-1': 'ami-0f36dcfcc94112ea1'
    });

    const defaultVPC = ec2.Vpc.fromLookup(this, 'defaultVPC', { isDefault: true });

    const instance = new ec2.Instance(this, 'MyInstance', {
      instanceType: t2Micro,
      machineImage: linuxAMI,
      vpc: defaultVPC
    });
  }
}
