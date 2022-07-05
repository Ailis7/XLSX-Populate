<template>
  <div id="options" v-if="start">
    <div v-for="(keys, i) in slvlArr" :key="i + 'top'">
      <h1 style="color: #e9c515">{{ keys[0].key }}</h1>

      <div v-for="(items, ind) in keys" :key="ind + 'inside'">
        <h3 style="color: #8fc023">{{ items.result }}</h3>
        <el-select
          v-on:change="change(...arguments, items)"
          clearable
          style="width: 100%"
          v-model="value[i + ind]"
          placeholder="Select"
          :value-key="items.key"
        >
          <el-option
            v-for="(option) in items.options"
            :key="option.optionsResult"
            :label="option.optionsResult"
            :value="option.optionsResult"
          >
          </el-option>
        </el-select>
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
import axios from 'axios';

export default {
  name: 'OptionsResolver',
  props: ['data'],
  data() {
    return {
      value: [],
      slvlArr: {},
      start: false,
    };
  },
  mounted() {
    console.log('hello')
    this.resultedSlvl();
  },
  methods: {
    change(optionIndex, item) {
      console.log(optionIndex, item, 'optionIndex, item')
      let parse = [];
      if (optionIndex !== '') {
        parse = item.options.filter(e => e.optionsResult === optionIndex)[0].data;
        console.log(parse)
      }
      let [, one, two, three, four] = parse;
      this.data.sportlvl[item.key][item.index][4] = one;
      this.data.sportlvl[item.key][item.index][5] = two;
      this.data.sportlvl[item.key][item.index][6] = three;
      this.data.sportlvl[item.key][item.index][7] = four;
      console.log(this.data.sportlvl[item.key][item.index], 'this.data.sportlvl[item.key][item.index]')
    },
    submit() {
       axios
        .post(process.env.VUE_APP_URL + '/writeToFile', this.data)
        .then((res) => {
          console.log(res, 'REEES');
        });
    },
    resultedSlvl() {
      const resultedSlvl = {};
      const parseingObj = this.data.sportlvl;
      const keys = Object.keys(parseingObj);
      keys.forEach((key) => {
        // this.value[key] = []
        if (key !== 'head') {
          parseingObj[key].forEach((result, index) => {
            if (index > 0) {
              if (result[8]) {
                if (!resultedSlvl[key]) resultedSlvl[key] = [];
                resultedSlvl[key].push({
                  result: `${result[1].replaceAll('/', '.')} ${result[2]} ${
                    result[3]
                  }`,
                  options: result[8],
                  index,
                  key,
                });
              }
            }
          });
        }
      });
      // setInterval(() => console.log(this.value, 'this.value'), 2000)
      this.slvlArr = resultedSlvl;
      this.start = true;
    },
  },
  computed: {
  },
};
</script>

<style lang="scss">
#options {
  color: white;
}
</style>
