export const state = {
    isPaused: false,
    stepRequested: false,
    delay: 100
};

export async function wait() {
    while (state.isPaused && !state.stepRequested) {
        await new Promise(r => setTimeout(r, 50));
    }
    state.stepRequested = false; // Reset the step
    await new Promise(r => setTimeout(r, state.delay));
}