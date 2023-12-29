import { v4 as uuidv4 } from "uuid";
import moment from "moment-timezone";

const instance = process.env.NEXT_PUBLIC_WA_INSTANCE_ID;
const token = process.env.NEXT_PUBLIC_WA_TOKEN_ID;

export async function getAllChats(id) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var urlencoded = new URLSearchParams();
  urlencoded.append("token", token);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const response = await fetch(
    `https://api.ultramsg.com/${instance}/chats?${urlencoded}`,
    requestOptions
  );
  const result = await response.text();
  const answer = JSON.parse(result);
  const found = answer.find((chat) => chat.id === id);
  return found;
}
export async function getAllMessages(id) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var urlencoded = new URLSearchParams();
  urlencoded.append("token", token);
  urlencoded.append("chatId", id);
  urlencoded.append("limit", "900");
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const response = await fetch(
    `https://api.ultramsg.com/${instance}/chats/messages?${urlencoded}`,
    requestOptions
  );
  const result = await response.text();
  const answer = JSON.parse(result);
  return answer;
}
export async function getDataFromWA(db, id, personal) {
  const phone = id.split("@")[0];
  const cliente = await db.collection("Clientes").findOne({
    $or: [
      { "telefono.telefono": phone },
      { "telefono.telefono": Number(phone) },
    ],
  });
  if (personal && !cliente) return;
  const chat = await getAllChats(id, instance, token);
  const messages = await getAllMessages(id, instance, token);
  const chatObj = {
    ...chat,
    messages,
  };

  if (cliente) {
    chatObj.clienteId = cliente._id;
    chatObj.clientName = cliente.razonSocial;
    chatObj.clienteDireccion = cliente.direccion[0]?.direccionNEW;
    chatObj.clientType = cliente.tipo;
  }
  const insert = await db.collection("Messages").insertOne(chatObj);
  const { insertedId } = insert;
  return insertedId;
}

export async function createResumenMensaje(db) {
  const currentStartOfWeek = moment()
    .add(-7, "days")
    .tz("America/Mexico_City")
    .startOf("week");

  const startOfWeek = currentStartOfWeek.unix();
  const endOfWeek = currentStartOfWeek.endOf("week").unix();
  const messagesResult = await db
    .collection("Messages")
    .aggregate([
      {
        $match: {
          $or: [
            {
              "messages.timestamp": {
                $gte: startOfWeek,
                $lte: endOfWeek,
              },
            },
          ],
        },
      },
      { $unwind: "$messages" },
      {
        $match: {
          $or: [
            {
              "messages.timestamp": {
                $gte: startOfWeek,
                $lte: endOfWeek,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          mensajesEnviados: {
            $sum: { $cond: [{ $eq: ["$messages.fromMe", true] }, 1, 0] },
          },
          mensajesRecibidos: {
            $sum: { $cond: [{ $eq: ["$messages.fromMe", false] }, 1, 0] },
          },
          archivosEnviados: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$messages.fromMe", true] },
                    { $ne: ["$messages.type", "chat"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          mensajesEnviados: 1,
          mensajesRecibidos: 1,
          archivosEnviados: 1,
        },
      },
    ])
    .toArray();
  const messages = messagesResult[0] || {};
  const conversacionesSinCliente = await db
    .collection("Messages")
    .aggregate([
      { $match: { clienteId: { $exists: false } } },
      { $group: { _id: null, total: { $sum: 1 } } },
      { $project: { _id: 0, total: 1 } },
    ])
    .toArray();
  const conversacionesPorCiudad = await db
    .collection("Messages")
    .aggregate([
      {
        $match: {
          "clienteDireccion.locality": { $exists: true },
          $or: [
            {
              "messages.timestamp": {
                $gte: startOfWeek,
                $lte: endOfWeek,
              },
            },
          ],
        },
      },
      { $unwind: "$clienteDireccion" },
      {
        $group: {
          _id: "$clienteDireccion.locality.long_name",
          total: { $sum: 1 },
        },
      },
    ])
    .toArray();
  const toInsert = {
    startOfWeek,
    endOfWeek,
    currentStartOfWeek: currentStartOfWeek.toDate(),
    _id:
      currentStartOfWeek.week().toString() +
      " " +
      currentStartOfWeek.year().toString(),
    conversacionesSinCliente: conversacionesSinCliente[0]?.total || 0,
    conversacionesPorCiudad,
    ...messages, // Spread the messages object
  };
  const MensajeRes = await db.collection("MessagesResumen").insertOne(toInsert);
  return MensajeRes;
}
export async function createResumenMensajeGeneral(db) {
  const startDate = moment.tz("2023-05-01", "America/Mexico_City");
  const endDate = moment.tz("2023-09-23", "America/Mexico_City");
  while (startDate.isBefore(endDate)) {
    const startOfWeek = startDate.startOf("week").unix();
    const endOfWeek = startDate.endOf("week").unix();
    const messagesResult = await db
      .collection("Messages")
      .aggregate([
        {
          $match: {
            $or: [
              {
                "messages.timestamp": {
                  $gte: startOfWeek,
                  $lte: endOfWeek,
                },
              },
            ],
          },
        },
        { $unwind: "$messages" },
        {
          $match: {
            $or: [
              {
                "messages.timestamp": {
                  $gte: startOfWeek,
                  $lte: endOfWeek,
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            mensajesEnviados: {
              $sum: { $cond: [{ $eq: ["$messages.fromMe", true] }, 1, 0] },
            },
            mensajesRecibidos: {
              $sum: { $cond: [{ $eq: ["$messages.fromMe", false] }, 1, 0] },
            },
            archivosEnviados: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$messages.fromMe", true] },
                      { $ne: ["$messages.type", "chat"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            mensajesEnviados: 1,
            mensajesRecibidos: 1,
            archivosEnviados: 1,
          },
        },
      ])
      .toArray();
    const conversacionesSinCliente = await db
      .collection("Messages")
      .aggregate([
        { $match: { clienteId: { $exists: false } } },
        { $group: { _id: null, total: { $sum: 1 } } },
        { $project: { _id: 0, total: 1 } },
      ])
      .toArray();

    const conversacionesPorCiudad = await db
      .collection("Messages")
      .aggregate([
        {
          $match: {
            "clienteDireccion.locality": { $exists: true },
            $or: [
              {
                "messages.timestamp": {
                  $gte: startOfWeek,
                  $lte: endOfWeek,
                },
              },
            ],
          },
        },
        { $unwind: "$clienteDireccion" },
        {
          $group: {
            _id: "$clienteDireccion.locality.long_name",
            total: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const toInsert = {
      startOfWeek,
      endOfWeek,
      currentStartOfWeek: moment(startOfWeek * 1000).toDate(),
      currentEndOfWeek: moment(endOfWeek * 1000).toDate(),
      conversacionesSinCliente: conversacionesSinCliente[0]?.total || 0,
      conversacionesPorCiudad,
      ...messagesResult[0], // Spread the messages object
    };
    const MensajeRes = await db
      .collection("MessagesResumen")
      .insertOne(toInsert);

    // Move to the next week
    startDate.add(1, "week");
  }
  console.log("done");
  return "All weeks processed";
}
export async function checkPhoneWA({ phone }) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", token);
  urlencoded.append("chatId", `${phone}@c.us`);
  urlencoded.append("nocache", "");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(
      `https://api.ultramsg.com/${instance}/contacts/check?` + urlencoded,
      requestOptions
    );
    const result = await response.json();
    return result.status;
  } catch (error) {
    return "error";
  }
}
export async function checkValidPhones(cliente, db) {
  try {
    const check = await db
      .collection("Clientes")
      .findOne({ _id: cliente }, { projection: { telefono: 1, _id: 0 } });
    if (!check || !check.telefono) return false;
    const phones = check.telefono.map((entry) => entry.telefono);
    const statuses = await Promise.all(
      phones.map((phone) => checkPhoneWA({ phone, instance, token }))
    );
    return statuses.some((status) => status === "valid");
  } catch (error) {
    console.log("Error in checkValidPhones:", error);
  }
}
export async function enviarMensaje({ db, clientId, body }) {
  const cliente = await db
    .collection("Clientes")
    .findOne({ _id: clientId, "telefono.wa": true });
  if (!cliente) return false;

  const phones = cliente.telefono
    .filter((entry) => entry.wa)
    .map((entry) => entry.telefono);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  for (const to of phones) {
    const raw = JSON.stringify({
      token,
      to: `+${to}`,
      body,
      priority: 10,
      referenceId: uuidv4(),
      msgId: uuidv4(),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    try {
      const response = await fetch(
        `https://api.ultramsg.com/${instance}/messages/chat`,
        requestOptions
      );
      const result = await response.text();
      const res = JSON.parse(result);

      const objToInsert = {
        id: res.id,
        from: "+525536554893",
        to: `+${to}`,
        author: "",
        pushname: "Sistema Sterling",
        ack: "",
        type: "chat",
        body,
        media: "",
        fromMe: true,
        self: false,
        isForwarded: false,
        isMentioned: false,
        mentionedIds: [],
        timestamp: Date.now() / 1000,
        filename: "",
        userId: "Sistema Sterling",
        userName: "Sistema Sterling",
      };

      const chatObj = {
        id: `${to}@c.us`,
        last_time: Date.now() / 1000,
        clienteId: clientId,
        clientName: cliente.razonSocial,
        clienteDireccion: cliente.direccion[0]?.direccionNEW || {},
        messages: [objToInsert],
        clientType: cliente.tipo,
      };

      await db
        .collection("Messages")
        .updateOne(
          { id: `${to}@c.us` },
          { $setOnInsert: chatObj, $push: { messages: objToInsert } },
          { upsert: true }
        );
    } catch (error) {
      console.log("error", error);
      return {
        code: 400,
        success: false,
        message: "Error al enviar el mensaje",
      };
    }
  }
  return true;
}
