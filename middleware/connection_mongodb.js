
module.exports = {
  wrapper : (connection) => {
    const close = async () => {
      await connection.client.close();
    };

    const collection = async (collectionName) => {
      return await connection.db.collection(collectionName);
    };

    connection.close = close;
    connection.release = close;
    connection.collection = collection;

    return connection;
  },
}