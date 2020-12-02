
export const executeServerAction = async (params) => {
    const response = await fetch('/api/collection', {
        method: "POST", headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params),
        credentials: "same-origin"
    });
    return response.json();
}
