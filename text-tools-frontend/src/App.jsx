import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { inputBoxAbi } from "./inputBoxAbi";

const DAPP_DEFAULT   = "0xab7528bb862fB57E8A2BCd567a2e929a0Be56a5e";
const INPUTBOX_DEFAULT = "0x59b22D57D4f067708AB0c00552767405926dc768";

function jsonToHex(obj){
  const s = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(s);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("");
}

export default function App(){
  const [dapp, setDapp] = useState(DAPP_DEFAULT);
  const [inputBox, setInputBox] = useState(INPUTBOX_DEFAULT);
  const [op, setOp] = useState("stats");
  const [text, setText] = useState("Cartesi top!");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending: sending } = useWriteContract();

  const injectedConnector = useMemo(
    () => connectors.find(c => c.id === injected().id) ?? connectors[0],
    [connectors]
  );

  async function onConnect(){
    setMsg({type:"", text:""});
    try{
      await connect({ connector: injectedConnector });
      setMsg({type:"hint", text:"Carteira conectada na rede Cartesi Local (31337)."});
    }catch(e){
      setMsg({type:"error", text: e?.shortMessage || e?.message || "Falha ao conectar."});
    }
  }

  async function onSend(){
    setMsg({type:"", text:""});
    if(!isConnected) return setMsg({type:"error", text:"Conecte a carteira."});
    if(!dapp || !inputBox) return setMsg({type:"error", text:"Preencha os endereços."});
    try{
      await writeContract({
        address: inputBox,
        abi: inputBoxAbi,
        functionName: "addInput",
        args: [dapp, jsonToHex({ op, text })],
      });
      setMsg({type:"ok", text:"Input enviado! Veja os NOTICE no terminal do `cartesi run`."});
    }catch(e){
      setMsg({type:"error", text: e?.shortMessage || e?.message || "Falha ao enviar."});
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo">TextTools<span>•Cartesi</span></div>
        <div className="right">
          {isConnected ? (
            <div className="wallet">
              <span className="pill"> {address.slice(0,6)}…{address.slice(-4)} </span>
              <button className="btn ghost" onClick={disconnect}>Sair</button>
            </div>
          ) : (
            <button className="btn primary" onClick={onConnect} disabled={connecting}>
              {connecting ? "Conectando..." : "Conectar carteira"}
            </button>
          )}
        </div>
      </header>

      <main className="wrap">
        <section className="panel">
          <h1 className="h1">Envie um input</h1>
          <p className="muted">
            O frontend chama <code>InputBox.addInput</code>. O resultado sai como <b>NOTICE</b> no terminal do
            <code> cartesi run</code>.
          </p>

          <div className="fields">
            <label>
              <span>DApp address</span>
              <input value={dapp} onChange={e=>setDapp(e.target.value)} placeholder="0x..." />
            </label>
            <label>
              <span>InputBox address</span>
              <input value={inputBox} onChange={e=>setInputBox(e.target.value)} placeholder="0x..." />
            </label>
          </div>

          <div className="ops">
            {["stats","shout","palindrome"].map(k => (
              <button key={k}
                className={`chip ${op===k ? "active":""}`}
                onClick={()=>setOp(k)}
                type="button">
                {k}
              </button>
            ))}
          </div>

          <label className="full">
            <span>Texto</span>
            <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} />
          </label>

          <div className="cta">
            <button className="btn primary lg" onClick={onSend} disabled={sending}>
              {sending ? "Enviando..." : "Enviar input"}
            </button>
          </div>

          {msg.text && (
            <div className={`note ${msg.type}`}>
              {msg.text}
            </div>
          )}
        </section>

        <section className="aside">
          <div className="card">
            <h3>Como usar</h3>
            <ol>
              <li>MetaMask na rede <b>Cartesi Local (31337)</b>.</li>
              <li>Use uma conta com saldo (importada do anvil/bundler).</li>
              <li>Conecte a carteira e envie o input.</li>
              <li>Veja o NOTICE no terminal do node.</li>
            </ol>
          </div>
          <div className="card">
            <h3>Endereços do node</h3>
            <code className="mono">DApp: {DAPP_DEFAULT}</code>
            <code className="mono">InputBox: {INPUTBOX_DEFAULT}</code>
          </div>
        </section>
      </main>

      <footer className="foot">© {new Date().getFullYear()} • TextTools</footer>
    </div>
  );
}
