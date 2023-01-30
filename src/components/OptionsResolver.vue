<template>
  <div id="options" v-if="start" :key="reRender">
    <div style="padding-top: 16px" >
      <div
        v-for="(nameSport, i) in slvlArr"
        :key="i + 'nameSport'"
        style="
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid;
          margin-bottom: 12px;
        "
      >
        <div style="font-weight: bold; width: 200px">
          {{ nameSport[0].key }}
        </div>
        <div style>{{ nameSport.length }}</div>
      </div>
    </div>

    <div v-for="(keys, i) in slvlArr" :key="i + 'top'">
      <h1 style="color: #e9c515">{{ keys[0].key }}</h1>

      <div
        v-for="(item, ind) in keys"
        :key="ind + 'inside'"
        style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px"
      >
        <div>
          <h3 style="color: #8fc023">{{ item.result }}</h3>
          <el-select
            v-on:change="change(...arguments, item)"
            clearable
            style="width: 100%"
            v-model="value[i + ind]"
            placeholder="Select"
            :value-key="item.key"
          >
            <el-option
              v-for="option in item.options"
              :key="option.optionsResult"
              :label="option.optionsResult"
              :value="option.optionsResult"
            >
            </el-option>
          </el-select>
        </div>
        <div style="display: flex;">
          <div v-if="item.currentOptionFirstPlayers" style="display: grid; width: 49%">
            <div v-if="!item.firstMemoryStatus">
              <h4 style="color: hotpink">Первая пара:</h4>
              <div style="display: flex; justify-content: space-between">
                <h5 style="display: inline">Спортлевел -</h5>
                <span style="padding-right: 12px">{{
                  item.currentOptionFirstPlayers.slvlCommand
                }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <h5 style="display: inline">В базe -</h5>
                <span style="padding-right: 12px">{{
                  item.currentOptionFirstPlayers.cubCommand
                }}</span>
              </div>
              <el-button
                @click="
                  writeToBase(
                    item.currentOptionFirstPlayers.slvlCommand,
                    item.currentOptionFirstPlayers.cubCommand,
                    item
                  )
                "
                style="padding: 2px 5px; width: 100%"
                type="warning"
                >Запомнить</el-button
              >
            </div>
            <div v-else>
              {{ item.firstMemoryStatus }}
            </div>
          </div>

          <hr />

          <div v-if="item.currentOptionSecondPlayers" style="display: grid; width: 49%">
            <div v-if="!item.secondMemoryStatus">
              <h4 style="color: hotpink">Вторая пара:</h4>
              <div style="display: flex; justify-content: space-between">
                <h5 style="display: inline">В базe -</h5>
                <span style="padding-right: 12px">{{
                  item.currentOptionSecondPlayers.slvlCommand
                }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <h5 style="display: inline">Спортлевел -</h5>
                <span style="padding-right: 12px">{{
                  item.currentOptionSecondPlayers.cubCommand
                }}</span>
              </div>
              <el-button
                @click="
                  writeToBase(
                    item.currentOptionSecondPlayers.slvlCommand,
                    item.currentOptionSecondPlayers.cubCommand,
                    item,
                    'second'
                  )
                "
                style="padding: 2px 5px; width: 100%"
                type="warning"
                >Запомнить</el-button
              >
            </div>
            <div v-else>
              {{ item.secondMemoryStatus }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-button
      v-on:click="submit"
      type="primary"
      style="width: 100%; margin-top: 40px"
      >Отправить</el-button
    >
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

export default {
  name: "OptionsResolver",
  props: ["data"],
  data() {
    return {
      value: [],
      slvlArr: {},
      start: false,
      reRender: 0,
    };
  },
  mounted() {
    this.resultedSlvl();
  },
  methods: {
    change(optionIndex, item) {
      let parse = [];
      if (optionIndex !== "") {
        parse = item.options.filter((e) => e.optionsResult === optionIndex);
      }

      // для отправки на бэк запомненных комманд
      this.slvlArr[item.key][item.index].currentOptionFirstPlayers =
        parse[0]?.fisrtPlayers;
      this.slvlArr[item.key][item.index].firstMemoryStatus = null;

      this.slvlArr[item.key][item.index].currentOptionSecondPlayers =
        parse[0]?.secondPlayers;
      this.slvlArr[item.key][item.index].secondMemoryStatus = null;

      this.data.sportlvl[item.key][item.index].financeData =
        parse[0].data.financeData;
    },
    submit() {
      axios
        .post(process.env.VUE_APP_URL + "/writeToFile", this.data)
        .then((res) => {
          console.log(res, "REEES");
        });
    },
    resultedSlvl() {
      const resultedSlvl = {};
      const parseingObj = this.data.sportlvl;
      const keys = Object.keys(parseingObj);
      keys.forEach((key) => {
        if (key !== "head") {
          parseingObj[key].forEach((result, index) => {
            if (result.options) {
              if (!resultedSlvl[key]) resultedSlvl[key] = [];
              resultedSlvl[key].push({
                result: `${moment(result.time).format("DD.MM.YYYY HH:mm")} ${
                  result.players
                }`,
                options: result.options,
                index,
                key,
              });
            }
          });
        }
      });
      this.slvlArr = resultedSlvl;
      this.start = true;
    },
    writeToBase(slvlCommand, cubCommand, item, commandPos = "first") {
      this.disabled = true;
      axios
        .post(process.env.VUE_APP_URL + "/addCommandToDB", {
          slvlCommand,
          cubCommand,
        })
        .then((res) => {
          if (commandPos === "first") {
            this.slvlArr[item.key][item.index].firstMemoryStatus = res.data;
          } else {
            this.slvlArr[item.key][item.index].secondMemoryStatus = res.data;
          }
          this.reRender += 1;
        })
    },
  },
  computed: {},
};
</script>

<style lang="scss">
#options {
  color: white;
  h4 {
    margin: 0;
    padding-bottom: 12px;
  }
  h5 {
    margin: 0;
  }
}
</style>
