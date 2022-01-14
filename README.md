# WELCOME TO DIGITAL WORLD

```
import { createAIPMConnector } from "./index.ts";

const aipm = await createAIPMConnector({
  ip: "192.168.1.176",
  mac: "1B03F4",
});

aipm.getInfoForever((e) => console.log(e));

aipm.on();
console.log("켜짐");
setTimeout(() => {
  aipm.off();
  console.log("꺼짐!!");
}, 10);
```

✅ Get voltage, current, frequency, power-factor, consumtion, accumulate, price, co2 info
![image](https://user-images.githubusercontent.com/35295182/149544021-5652506e-0359-4e58-a737-0b82d50cb834.png)
✅ Switch on-off

[Demo Video](https://twitter.com/ryc0nt/status/1481984253336649732)

제가 했을땐 잘 됐는데 다른 환경에선 테스트 안해봤습니다 .., 

이 레포 참조했어요 

[godmode2k/test_power_manager](https://github.com/godmode2k/test_power_manager)
