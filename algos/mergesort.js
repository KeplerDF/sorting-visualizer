async function mergeSort(arr, start, end, id) {
    if (start >= end) return;
    let mid = Math.floor((start + end) / 2);
    await mergeSort(arr, start, mid, id);
    await mergeSort(arr, mid + 1, end, id);
    await merge(arr, start, mid, end, id);
}

async function merge(arr, start, mid, end, id) {
    let left = arr.slice(start, mid + 1);
    let right = arr.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;
    while (i < left.length && j < right.length) {
        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
        render(arr, id);
        await wait();
    }
    while (i < left.length) arr[k++] = left[i++];
    while (j < right.length) arr[k++] = right[j++];
    render(arr, id);
}