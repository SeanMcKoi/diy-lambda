
export const handler = async (event) => {
    let body;

    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return response(400, {
            error: "Ugyldig JSON request body."
        });
    }

    const { operation, a, b, decimals } = body;

    if (operation === "pi") {
        if (
            !Number.isInteger(decimals) ||
            decimals < 0 ||
            decimals > 25
        ) {
            return response(400, {
                error: "Antall desimaler må være et mellom 0 og 25."
            });
        }

        return response(200, {
            operation: "pi",
            result: Math.PI.toFixed(decimals)
        });
    }

    const parseOperand = (value) => {
        if (value === "pi") {
            return Math.PI;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        return undefined;
    };

    const aValue = parseOperand(a);
    const bValue = parseOperand(b);

    if (aValue === undefined || bValue === undefined) {
        return response(400, {
            error: 'a og b må være tall eller stringen "pi".'
        });
    }

    let result;

    switch (operation) {
        case "add":
            result = aValue + bValue;
            break;

        case "subtract":
            result = aValue - bValue;
            break;

        case "multiply":
            result = aValue * bValue;
            break;

        case "divide":
            if (bValue === 0) {
                return response(400, {
                    error: "Kan ikke dele på 0!"
                });
            }

            result = aValue / bValue;
            break;

        default:
            return response(400, {
                error: "Ugyldig operasjon.",
                supported: [
                    "add",
                    "subtract",
                    "multiply",
                    "divide",
                    "pi"
                ]
            });
    }

    if (!Number.isFinite(result)) {
        return response(400, {
            error: "Resultatet er utenfor gyldig område."
        });
    }

    if (decimals !== undefined) {
        if (
            !Number.isInteger(decimals) ||
            decimals < 0 ||
            decimals > 25
        ) {
            return response(400, {
                error: "Antall desimaler må være et heltall mellom 0 og 25."
            });
        }

        result = roundResult(result, decimals);
    }

    return response(200, {
        operation,
        a,
        b,
        result
    });
};

function roundResult(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

function response(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}
