<script setup lang="ts">
import { computed } from "vue";
import "chart.js/auto";
import { Doughnut } from "vue-chartjs";

const props = defineProps<{
    labels: string[];
    values: number[];
}>();

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [{ data: props.values }],
}));

const options = {
    responsive: true,
    maintainAspectRatio: false,
};
</script>
<template>
    <div class="h-72">
        <Doughnut :data="chartData" :options="options" />
    </div>
</template>
