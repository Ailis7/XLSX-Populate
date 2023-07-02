<template>
	<div v-loading="loading">
		<div v-show="show">
			<main>
				<el-button id="button" @click="copy">СПОРТЛЕВЕЛ</el-button>
				<el-button @click="loadData">--тест</el-button>
				<el-button type="primary" @click="betradarParse">БЕТРАДАР</el-button>
			</main>
		</div>
		<div v-if="!show">
			<el-button @click="show = !show">Назад</el-button>
			<OptionsResolver :data.sync="data" />
		</div>
	</div>
</template>

<script>
import axios from "axios";
import OptionsResolver from "./components/OptionsResolver.vue";

export default {
	name: "App",
	components: { OptionsResolver },
	data() {
		return {
			loading: false,
			show: true,
			fileCub: [],
			fileSportlevel: [],
			data: {},
		};
	},
	methods: {
		loadData() {
			const formData = new FormData();
			this.fileCub.forEach((file) => {
				console.log(file, "file");
				formData.append("files", file.raw);
			});

			axios
				.post(process.env.VUE_APP_URL + "/getResult", this.fileCub[0])
				.then((res) => {
					console.log(res, "REEES");
				});
		},
		copy() {
			this.loading = true;
			// console.log(this.fileCub, this.fileSportlevel);
			axios
				.get(process.env.VUE_APP_URL + "/getResult")
				.then((res) => {
					console.log(res,' res')
					this.loading = false;
					this.show = false;
					this.data = res.data;
				})
				.catch(() => {
					this.loading = false;
				});
		},
		betradarParse() {
			this.loading = true;
			axios
				.get(process.env.VUE_APP_URL + "/betradarParse")
				.then((res) => {
					console.log(res,' res')
					this.loading = false;
					this.show = false;
					this.data = res.data;
				})
				.catch(() => {
					this.loading = false;
				});
		}
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
		"div div"
		"div div"
		"button button";
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
