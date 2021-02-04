<template>
  <div>
    <div style="background-color: grey">
      <div>SignalR Host: <input v-model="host" /></div>
      <div>Hub: <input v-model="path" /></div>
      <div>
        <button v-bind:disabled="connected" v-on:click="connect">
          Connect
        </button>
      </div>
    </div>
    <div>
      Receive Identity：:{{ identity }}
      <div>
        Identity：<input v-bind:disabled="!connected" v-model="sendIdentity" />
      </div>
      <div>
        Message:
        <div>
          <textarea v-bind:disabled="!connected" v-model="responseContent" />
        </div>
      </div>
      <button v-bind:disabled="!connected" v-on:click="sendResponse">
        Send
      </button>
    </div>
    <div  style="background-color: grey">
      <div>Topic:<input v-bind:disabled="!connected" v-model="subtopic" /></div>
      <div>Duration(milliseconds):<input v-bind:disabled="!connected" v-model="subduration" /></div>
      <div>Once:<input type="checkbox" v-bind:disabled="!connected" v-model="subOnce" /></div>
      <button v-bind:disabled="!connected" v-on:click="subscribeTopic">
        Subscribe
      </button>
    </div>
    <div>
      Messages:
      <ul>
        <li v-for="(item, key) in messages" v-bind:key="key" class="dtx">
          [{{ key + 1 }}][{{ item.time }}]: {{ item.data }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
  data() {
    return {
      host: "10.12.23.66",
      path: "/R/Notification",
      messages: [],
      connection: null,
      connected: false,
      identity: "",
      topic: "",
      sendIdentity: "testtopic",
      responseContent: null,
      subtopic: "subs",
      subduration:60000,
      subOnce:false
    };
  },
  methods: {
    connect: function () {
      let urlPath = `${this.host}${this.path}`;
      this.pushMessage(urlPath);
      let that = this;
      try {
        const signalr = require("@aspnet/signalr");
        //build connection
        this.connection = new signalr.HubConnectionBuilder()
          .withUrl(`http://${urlPath}`)
          .configureLogging(signalr.LogLevel.Trace)
          .build();
        //listen method ReceiveMessage(string message)
        this.connection.on("ReceiveMessage", (message) => {
          that.pushMessage("ReceiveMessage(string message)");
          that.pushMessage(`[ReceiveMessage()]${message}`);
        });
        //set listen method ReceiveMessageWithResponse(string identity, string message)
        this.connection.on(
          "ReceiveMessageWithResponse",
          (identity, message) => {
            that.pushMessage(
              "ReceiveMessageWithResponse(string identity, string message)"
            );
            that.topic = topic;
            that.identity = identity;
            that.sendIdentity = identity;
            that.pushMessage(
              `[ReceiveMessageWithResponse()][${identity}]${message}`
            );
          }
        );
        //start connection
        this.connection.start().then(() => {
          that.pushMessage("connected the hub.");
          that.connected = true;
        });
        //close event
        this.connection.onclose((error) => {
          try {
            that.connected = false;
            that.pushMessage(error);
            that.connection.start().then(() => {
              that.pushMessage("reconnected the hub.");
              that.connected = true;
            });
          } catch (error) {
            this.connected = false;
            this.pushMessage(error);
          }
        });
      } catch (error) {
        this.connected = false;
        this.pushMessage(error);
      }
    },

    pushMessage: function (msg) {
      this.messages.unshift({
        data: msg,
        time: new Date().toLocaleTimeString(),
      });
    },
    sendResponse: function () {
      if (this.connection) {
        this.pushMessage(this.responseContent);
        let that = this;
        this.connection
          .invoke("ReceiveMessage", this.sendIdentity, this.responseContent)
          .then((result) => {
            this.pushMessage(
              `response:[${that.responseContent}] with result:${result}`
            );
          });
      }
    },
    subscribeTopic: function () {
      if (this.connection) {
        this.pushMessage(`Subscribe topic:[${this.subtopic}] duration:[${this.subduration}] once:[${this.subOnce}]`);
        let that = this;
        this.connection
          .invoke("SubscribeTopic", this.subtopic, this.subduration, this.subOnce)
          .then((result) => {
            this.pushMessage(
              `Subscribe topic:[${this.subtopic}] duration:[${this.subduration}] once:[${this.subOnce}] with result:${result}`
            );
          });
      }
    },
  },
};
</script>

<style>
.dtx {
  color: red;
}
li {
  list-style-type: none;
}
</style>