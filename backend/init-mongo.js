print("Configuring MongoDB replica set...");

rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongodb1:27017" }],
});

print("Replica Set initiated");
