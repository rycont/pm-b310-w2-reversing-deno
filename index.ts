import {
  Client,
  Event,
  Packet,
} from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

const hex2dec = (data: number[]) =>
  new Float32Array(new Uint8Array([...data]).buffer)[0];

function chunk(arr: number[], n: number) {
  return arr.reduce(
    (acc, _, i) => (i % n ? acc : [...acc, arr.slice(i, i + n)]),
    [] as number[][]
  );
}

const INFO_KEYS = [
  "voltage",
  "current",
  "frequency",
  "power-factor",
  "wattage",
  "accumulate",
  "price",
  "co2",
] as const;

export type Info = Record<typeof INFO_KEYS[number], number>;

export const createAIPMConnector = async (connectionInfo: {
  mac: string;
  ip: string;
  port?: number;
}) => {
  const client = new Client({
    hostname: connectionInfo.ip,
    port: connectionInfo.port || 5000,
  });

  await client.connect();

  const schemeVersion = 0xfa;
  const serializedMac = [...connectionInfo.mac].map((e) => e.charCodeAt(0));

  function send(message: number[]) {
    const buffer = new Uint8Array(25);
    buffer.set([schemeVersion, ...serializedMac, ...message]);
    return client.write(buffer);
  }

  let infoListener: (info: Info) => void;

  client.addListener(Event.receive, async (c, d: Packet) => {
    const [command, ...data] = d.data.slice(7);
    if (command === 0x51) {
      await send([0x58, 0x16, 0x01, 0x0e, 0x06, 0xfb, 0x46, 0x0d]);
    }
    if (command === 0x5a) {
      await send([0x74, 0x50, 0x75, 0x73, 0x68, 0xfb, 0x4b, 0x0d]);
    }
    if (command === 0x41) {
      await send([0x50, 0x01, 0x00, 0x00, 0xfb, 0x52, 0x0d]);
    }
    if (command === 0x76) {
      await send([0x50, 0x01, 0x00, 0x00, 0xfb, 0x52, 0x0d]);
      await send([0x50, 0x01, 0x00, 0x00, 0xfb, 0x52, 0x0d]);
    }
    if (command === 0x40) {
      if (!infoListener) return;
      infoListener(
        Object.fromEntries(
          chunk(data.slice(0, INFO_KEYS.length * 4), 4)
            .map(hex2dec)
            .map((v, i) => [INFO_KEYS[i], v])
        ) as Info
      );

      await send([0x74, 0x50, 0x75, 0x73, 0x68, 0xfb, 0x4b, 0x0d]);
    }
  });

  return {
    async on() {
      return await send([0x57, 0x01, 0xfb, 0xf3, 0x0d]);
    },
    async off() {
      return await send([0x57, 0xa4, 0xfb, 0xf0, 0x0d]);
    },
    async getInfoForever(listener: typeof infoListener) {
      infoListener = listener;
      return await send([0x51, 0x18, 0x39, 0x00, 0xfb, 0x71, 0x0d]);
    },
  };
};

export interface AIPM {
  mac: string;
  ip: string;
  alias: string;
  connector?: {
    on(): Promise<number>;
    off(): Promise<number>;
    getInfoForever(listener: (info: Info) => void): Promise<number>;
  };
}

export const seekAIPM = (broadcastaddr: string): Promise<AIPM[]> => {
  const addr: Deno.NetAddr = {
    transport: "udp",
    port: 4999,
    hostname: broadcastaddr,
  };
  const socket = Deno.listenDatagram({
    port: 4999,
    transport: "udp",
    hostname: "0.0.0.0",
  });

  socket.send(new Uint8Array([0x50, 0x4d, 0x20, 0x52, 0x65, 0x71, 0x21]), addr);

  const aipm: AIPM[] = [];

  return new Promise((resolve) => {
    const receiveAIPM = setInterval(async () => {
      const data = await socket.receive();
      const [mac, ip, alias] = new TextDecoder().decode(data[0]).split("/");
      if (alias) {
        if (!aipm.find((e) => e.mac === mac)) {
          aipm.push({
            mac,
            ip,
            alias,
          });
        }
      }
    }, 10);
    setTimeout(() => {
      clearInterval(receiveAIPM);
      resolve(aipm);
    }, 5500);
  });
};
