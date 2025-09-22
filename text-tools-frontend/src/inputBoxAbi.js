export const inputBoxAbi = [
  {
    type: "function",
    name: "addInput",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dapp", type: "address" },
      { name: "input", type: "bytes" }
    ],
    outputs: []
  }
];
