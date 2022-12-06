import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ga from "aws-cdk-lib/aws-globalaccelerator";

interface config extends cdk.StackProps {
  eastArn: string;
  westArn: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: config) {
    super(scope, id, props);

    const dnsZone = route53.HostedZone.fromHostedZoneAttributes(this, "zone", {
      zoneName: "dev.matthewzhaocc.com",
      hostedZoneId: "Z0710105XLGTP537NLYE",
    });

    const gaDeployment = new ga.Accelerator(this, "edge");

    const listener = gaDeployment.addListener("443", {
      portRanges: [{ fromPort: 443, toPort: 443 }],
      protocol: ga.ConnectionProtocol.TCP,
    });

    const eastEG = listener.addEndpointGroup("east-1", {
      region: "us-east-1",
      trafficDialPercentage: 50,
    });

    const westEG = listener.addEndpointGroup("west-1", {
      region: "us-west-1",
      trafficDialPercentage: 50,
    });

    eastEG.addEndpoint(
      new ga.RawEndpoint({
        region: "us-east-1",
        endpointId: props?.eastArn as string,
      })
    );

    westEG.addEndpoint(
      new ga.RawEndpoint({
        region: "us-west-1",
        endpointId: props?.westArn as string,
      })
    );

    new route53.CnameRecord(this, "global-record", {
      recordName: "multi-zone.dev.matthewzhaocc.com",
      zone: dnsZone,
      domainName: gaDeployment.dnsName,
    });
  }
}
