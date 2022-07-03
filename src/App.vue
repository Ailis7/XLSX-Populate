<template>
  <div v-loading="loading">
    <div v-show="show">
      <main>
        <el-button id="button" @click="copy">СПОРТЛЕВЕЛ</el-button>
        <el-button @click="getID">Выдрать id, месяц {{ month }}</el-button>
        <el-button @click="loadData">--тест</el-button>
      </main>
      <div>
        <div style="color: white; fontsize: 2rem">
          {{ techProblemArr }}
        </div>
        <el-checkbox v-model="getTechByMonth"
          ><h1 style="color: green">
            За месяц: {{ month }}, год: {{ year }}
          </h1></el-checkbox
        >
        <el-button style="width: 100%" @click="techProblem"
          >techProblem</el-button
        >
      </div>
    </div>
    <div v-if="!show">
      <OptionsResolver :data.sync="data" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import OptionsResolver from './components/OptionsResolver.vue';

export default {
  name: 'App',
  components: { OptionsResolver },
  mounted() {
    // this.copy()
  },
  data() {
    return {
      loading: false,
      show: true,
      fileCub: [],
      fileSportlevel: [],
      techProblemArr: [
        '2022-05-01',
        '2022-05-02',
        '2022-05-03',
        '2022-05-04',
        '2022-05-05',
        '2022-05-06',
        '2022-05-07',
        '2022-05-08',
        '2022-05-09',
        '2022-05-10',
        '2022-05-11',
        '2022-05-12',
        '2022-05-13',
        '2022-05-14',
        '2022-05-15',
        '2022-05-16',
        '2022-05-17',
        '2022-05-18',
        '2022-05-19',
        '2022-05-20',
        '2022-05-21',
        '2022-05-22',
        '2022-05-23',
        '2022-05-24',
        '2022-05-25',
        '2022-05-26',
        '2022-05-27',
        '2022-05-28',
        '2022-05-29',
        '2022-05-30',
        '2022-05-31',
      ],
      // techProblemArr: [
      //   ['2022-05-01', '2022-05-02'],
      //   '2022-04-09',
      //   '2022-04-10',
      //   '2022-04-14',
      //   '2022-04-20',
      //   '2022-04-29',
      // ],
      month: '4',
      year: '2022',
      getTechByMonth: false,
      data: {},
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
      this.loading = true;
      // console.log(this.fileCub, this.fileSportlevel);
      axios
        .get(process.env.VUE_APP_URL + '/getResult')
        .then((res) => {
          this.loading = false;
          this.show = false;
          this.data = res.data;
          // console.log(res.data.sportlvl['NBA 2K'][1], 'REEES');
        })
        .catch(() => {
          this.loading = false;
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
      let arr = [];
      if (this.getTechByMonth) {
        arr = [
          [
            moment(`${this.year}-${this.month}`, 'YYYY-MM-DD').format(
              'YYYY-MM-DD',
            ),
            moment(`${this.year}-${this.month}`, 'YYYY-MM-DD')
              .endOf('month')
              .format('YYYY-MM-DD'),
          ],
        ];
        arr.getTechByMonth = true;
      } else {
        arr = this.techProblemArr;
      }
      axios
        .post(process.env.VUE_APP_URL + '/techProblem', {
          arr,
        })
        .then((res) => {
          console.log(res, 'REEES');
        });
    },
    getID() {
      axios
        .post(process.env.VUE_APP_URL + '/getID', {
          month: this.month,
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
