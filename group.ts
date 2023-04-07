export const groupBy = <T extends Record<string,unknown>|null>(array: T[], by: (item: T) => string|number) => {
    return array.reduce(
        (map, value) => {
            if (value === null) {
                return map;
            }

            const by_value = by(value);

            (map[by_value] = map[by_value] || []).push(value);

            return map;
        },
        {} as Record<string, NonNullable<T>[]>
    );
}