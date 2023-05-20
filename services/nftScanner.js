// const userAddress = "juno130mdu9a0etmeuw52qfxk73pn0ga6gawk4k539x";

function stringToBytes(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    var byteValue = charCode.toString(16).padStart(2, "0");
    bytes.push(byteValue);
  }
  return bytes.join("");
}

const getCollections = async (userAddress) =>
  new Promise((resolve, reject) => {
    fetch(`https://api.mintscan.io/v1/juno/wasm/nft/${userAddress}/collections`)
      .then((res) => res.json())
      .then(resolve)
      .catch(reject);
  });

const createURL = (contract_address, userAddress) => {
  const userToken = {
    tokens: {
      owner: userAddress,
      limit: 30,
      start_after: "0",
    },
  };
  const v = stringToBytes(JSON.stringify(userToken));

  return (
    `https://lcd-juno.cosmostation.io/wasm/contract/${contract_address}/smart/${v}` +
    "?encoding=UTF-8"
  );
};

exports.processCollections = async (userAddress) => {
  const { contracts: collections } = await getCollections();

  const result = [];
  const length = collections?.length;
  for (var i = 300; i < 400; i++) {
    if (!collections[i]?.contract_address) {
      continue;
    }

    await fetch(createURL(collections[i].contract_address, userAddress))
      .then((res) => res.json())
      .then(async (res) => {
        try {
          let t = atob(res?.result?.smart);
          t = JSON.parse(t)?.tokens;
          console.log(i + 1 + " of " + length);
          for (const token of t) {
            const b = stringToBytes(
              JSON.stringify({ nft_info: { token_id: token } })
            );
            console.log(b);
            try {
              const r = await fetch(
                `https://lcd-juno.cosmostation.io/wasm/contract/${collections[i].contract_address}/smart/${b}` +
                  "?encoding=UTF-8"
              );
              const d = await r.json();
              const s = JSON.parse(atob(d?.result?.smart));

              const f = await fetch(
                "https://api.mintscan.io/v1/utils/ipfs/meta?link=" +
                  s?.token_uri
              );
              const d2 = await f.json();
              //   console.log(d2);
              //   console.log(JSON.parse(d2.meta));
              result.push({
                r: d2,
                label: collections[i].label,
                contract_address: collections[i].contract_address,
              });
            } catch (err) {
              console.log(err);
            }
          }
        } catch (err) {}
      });
  }
  return result;
};
