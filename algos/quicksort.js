export async function quickSort(arr, left, right, id) {
    if (left >= right) return;
    let index = await partition(arr, left, right, id);
    await Promise.all([
        quickSort(arr, left, index - 1, id),
        quickSort(arr, index + 1, right, id)
    ]);
}

export async function partition(arr, left, right, id) {
    let pivotValue = arr[right];
    let pivotIndex = left;
    for (let i = left; i < right; i++) {
        if (arr[i] < pivotValue) {
            [arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
            pivotIndex++;
            render(arr, id);
            await wait();
        }
    }
    [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];
    render(arr, id);
    return pivotIndex;
}
