import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certManager from "aws-cdk-lib/aws-certificatemanager";

export class BackendStack extends cdk.Stack {
  public lbArn: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const region = props?.env?.region || "not-detected-region";

    const dnsZone = route53.HostedZone.fromHostedZoneAttributes(this, "zone", {
      zoneName: "dev.matthewzhaocc.com",
      hostedZoneId: "Z0710105XLGTP537NLYE",
    });

    const certificate = new certManager.Certificate(this, "tls-cert", {
      validation: certManager.CertificateValidation.fromDns(dnsZone),
      domainName: `${region}.multi-zone.dev.matthewzhaocc.com`,
      subjectAlternativeNames: ["multi-zone.dev.matthewzhaocc.com"],
    });

    const app = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "app-deployment",
      {
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry(
            "public.ecr.aws/m6h8t0n2/global-accel-backend-app:latest"
          ),
          environment: {
            PORT: "80",
            APP_REGION: region,
          },
          containerPort: 80,
        },
        certificate: certificate,
        domainZone: dnsZone,
        domainName: `${region}.multi-zone.dev.matthewzhaocc.com`,
        cpu: 256,
        memoryLimitMiB: 1024,
      }
    );

    const scalableTaskCount = app.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 5,
    });

    scalableTaskCount.scaleOnCpuUtilization("cpuScaling", {
      targetUtilizationPercent: 40,
    });

    this.lbArn = app.loadBalancer.loadBalancerArn;
  }
}
