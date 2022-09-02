# Cloud Development Kit

## CDK 등장배경

CloudFormation의 사용성 문제를 생각해 보자.

- 점점 방대해지는 YAML/JSON 파일 길이
- 프로그래밍 언어가 아닌 단순한 텍스트 파일로서 IDE 지원이 제한적임
- 추상화가 없는 저수준 설정을 해야 함

## CDK의 이점

1. 다음 중 좋아하는 언어를 골라서 작성 가능
    
    TypeScript, JavaScript, Python, Java, C#
    
2. IDE의 도움을 받음
3. 추상화를 할 수 있음
4. CFT 보다 간결하게 자원을 명세 가능

## Construct

CDK는 Construct라는 단위로 자원을 명세한다.

- 스택은 Consturct 여럿을 가질 수 있다.
- Construct는 AWS 자원을 하나 이상 갖는다. 또 다른 Construct를 포함할 수도 있다.
- CDK Application는 CFT로 변환되며, CloudFormation이 AWS에 자원을 배치하게 된다.

## 준비물

1. **Node.js 설치**
    
    어떤 언어로 CDK를 개발하던 Node.js 10.13 이상의 버전이 필요하다
    
2. **aws-cdk 툴킷 설치**
    
    ```bash
    npm install -g aws-cdk
    ```
    

## CDK 활용 Cheat Sheet

**명령어 설명**

`npm run watch` - 실시간 코드 감지 & 컴파일을 수행한다.

`cdk bootstrap` - CDK가 사용할 버킷을 (스택으로서) 만든다. 최초 1번 수행하면 된다.

`cdk synth` - 응용을 CloudFormation 템플릿으로 변환한다. `cdk.out` 폴더에 생성된다.

`cdk deploy` - CloudFormation 템플릿을 배포한다. `cdk synth`가 이미 포함된 명령어다.

`cdk diff` - 현재 스택과 CDK 응용의 차이점을 보여준다.

1. 초기 설정 상용구 코드
    
    ```bash
    cdk init & (npm watch 또는 virtualenv) & cdk bootstrap
    ```
    
2. Construct 별 API를 잘 참조하기
    
    [API Reference · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html)
    
3. Construct를 코드에서 참조하기 위해 의존성 선언
    
    ```tsx
    // typescript
    import s3 = require('@aws-cdk-lib/aws-s3');
    // python 
    from aws_cdk import aws_s3 as s3
    ```
    
4. 3에서 의존성을 찾을 수 없을 경우 의존 파일 다운로드 하기
    
    ```bash
    // typescript
    npm install @aws-cdk-lib/aws-s3
    // python
    pip install aws-cdk.aws-s3
    ```
    
5. 코딩하기
6. 배포하기
    
    ```bash
    cdk diff
    # cdk synth
    cdk deploy
    ```
    

# CDK Typescript 실습

## 준비물

**Typescript 설치**

```bash
npm install -g typescript
```

**프로젝트 구조 생성**

```bash
cdk init sample-app --language typescript
```

## 파일 설명

`package.json` - npm 모듈의 매니페스트 파일이다.

`bin/cdk-typescript.ts` - CDK 응용의 진입 지점이다.

`lib/cdk-typescript-stack.ts` - 우리가 개발할 파일이다. 스택/컨스트럭트/AWS 자원을 정의한다.

`cdk.out` 폴더 - 변환된 템플릿 파일이 담긴다.

## 버킷 만들어 보기

공식 문서를 참고하여 생성자 및 주입 가능한 속성을 익히자.

[class Bucket (construct) · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html)

```tsx
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CdkTypescriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkTypescriptQueue', {
      visibilityTimeout: Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkTypescriptTopic');

    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true,
      bucketName: "bucket-from-typescript-cdk"
    });

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
```

## EC2 만들어 보기

기본 VPC에 t2.micro 인스턴스 하나를 배치한다.

```bash
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
```

## ⚠️ 목표 리전 및 계정 상정하기

방금 EC2 예제에서 `cdk diff`실행시, 어느 리전의 VPC를 가리키는 것인지 맥락이 제공되어 있지 않다며 변경 시뮬레이션을 할 수 없다고 안내된다.

```bash
Error: Cannot retrieve value from context provider vpc-provider 
since account/region are not specified at the stack level. 

Configure "env" with an account and region when you define your stack.
See https://docs.aws.amazon.com/cdk/latest/guide/environments.html for more details.
```

### 해법 -  Environment 객체 주입

`**Environment`의 스키마**

스택이 배포될 AWS 계정 및 지역을 표상한다.

```tsx
{ account: String, region: String } 
```

**주입법1:** 하드 코딩

```tsx
new CodingEc2Stack(app, 'CodingEc2Stack', { 
    env: { 
        account: "123123123", // AWS 계정 아이디
        region: "ap-northeast-1" // 리전명
    }    
});
```

**환경 변수 사용하기**

```tsx
new CodingEc2Stack(app, 'CodingEc2Stack', { 
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    }    
});
```

```bash
CDK_DEFAULT_ACCOUNT=default, CDK_DEFAULT_REGION=ap-northeast-1 cdk diff
```