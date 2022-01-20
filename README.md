# WELCOME TO DIGITAL WORLD

```
import { createAIPMConnector, seekAIPM, AIPM } from "./index.ts";

const aipm: AIPM[] = await seekAIPM("192.168.1.255");
const aipmIndex: string[] = aipm.map((e) => e.alias);

for (let i = 0; i < aipm.length; i++) {
  aipm[i].connector = await createAIPMConnector({
    ip: aipm[i].ip,
    mac: aipm[i].mac,
  });
}

aipm[aipmIndex.indexOf("ALIAS")].connector?.on();
```

- ✅ Seek PM Devices
- ✅ Switch on-off
- ✅ Get voltage, current, frequency, power-factor, consumtion, accumulate, price, co2 info
  ![image](https://user-images.githubusercontent.com/35295182/149544021-5652506e-0359-4e58-a737-0b82d50cb834.png)

[Demo Video](https://twitter.com/ryc0nt/status/1481984253336649732)

제가 했을땐 잘 됐는데 다른 환경에선 테스트 안해봤습니다 ..,

이 레포 참조했어요

[godmode2k/test_power_manager](https://github.com/godmode2k/test_power_manager)
