<template>
  <div>
    <main>
      <div class="text">Файл Куба</div>
      <pl-upload
        v-model="fileCub"
        @on-change="cubLoad"
        :on-remove="cubRemove"
        :limit="1"
        accept=".xlsx, xls"
      ></pl-upload>
      <div class="text">Файл Спортлевела</div>
      <pl-upload
        v-model="fileSportlevel"
        @on-change="sportlevelLoad"
        :limit="1"
        accept=".xlsx, xls"
      ></pl-upload>

      <el-button id="button" @click="copy">Сделать копирование</el-button>
      <el-button @click="loadData">Сделать копирование</el-button>
    </main>
    <div>
      <div style="color: white; fontsize: 2rem">
        {{ techProblemArr }}
      </div>
      <el-button style="width: 100%" @click="techProblem"
        >techProblem</el-button
      >
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  components: {},
  mounted: () => {
    console.log;
  },
  data() {
    return {
      fileCub: [],
      fileSportlevel: [],
      techProblemArr: [ "2022-05-03", "2022-05-08", "2022-05-20", "2022-05-27" ],
      // techProblemArr: [
      //   ['2022-04-07', '2022-04-08'],
      //   '2022-04-09',
      //   '2022-04-10',
      //   '2022-04-14',
      //   '2022-04-20',
      //   '2022-04-29',
      // ],
    };
  },
  methods: {
    loadData() {
      const formData = new FormData();
      this.fileCub.forEach((file) => {
        console.log(file, 'file');
        formData.append('files', file.raw);
      });

      axios
        .post(process.env.VUE_APP_URL + '/getResult', this.fileCub[0])
        .then((res) => {
          console.log(res, 'REEES');
        });
    },
    copy() {
      // console.log(this.fileCub, this.fileSportlevel);
      axios.get(process.env.VUE_APP_URL + '/getResult').then((res) => {
        console.log(res.data, 'REEES');
      });
      // console.log(axios, 'axios');
    },
    cubLoad(file) {
      if (this.fileCub.length > 0) {
        alert('Файл уже загружен, сначала удалите');

        setTimeout(() => {
          console.log(this.fileCub);
          // this.cubRemove();
        }, 1000);
      } else {
        this.fileCub.push(file);
      }
    },
    cubRemove() {
      console.log('cubRemove');
      this.fileCub.splice(-1);
    },
    sportlevelLoad(file) {
      this.fileSportlevel.push(file);
    },
    techProblem() {
      axios
        .post(process.env.VUE_APP_URL + '/techProblem', {
          arr: this.techProblemArr,
        })
        .then((res) => {
          console.log(res, 'REEES');
        });
    },
  },
};
</script>

<style lang="scss">
body {
  background-color: rgb(40, 33, 71);
}
main {
  display: grid;
  grid-template-columns: 40% 1fr;
  grid-template-areas:
    'div div'
    'div div'
    'button button';
  grid-auto-rows: 200px;
  align-items: center;
  .text {
    color: rgb(187, 170, 170);
    font-size: 3rem;
  }
}
#button {
  grid-area: button;
  background-color: saddlebrown;
  color: rgb(39, 185, 83);
  font-size: 2rem;
  font-weight: 700;
}
.pl-upload {
  width: 100%;
  div {
    width: 100%;
    background-color: rgb(103, 89, 155);
    font-size: 1.2rem;
    span p {
      font-size: 1.2rem !important;
    }
    .el-button {
      font-size: 1.2rem;
      background-color: rgb(161, 165, 221);
    }
  }
  .el-upload-list__item-name {
    color: #21d4dd;
    font-weight: 600;
    font-size: 1.5rem;
  }
  .el-icon-close::before {
    font-size: 2rem;
    color: red;
    font-weight: 600;
  }
}
</style>
