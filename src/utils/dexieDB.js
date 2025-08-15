import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(1).stores({
  values: "key,value"
});

export async function setItem(key, value) {
  await db.values.put({ key, value });
}

export async function getItem(key) {
  const entry = await db.values.get(key);
  return entry ? entry.value : null;
}
