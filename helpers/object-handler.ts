export class JObjectHandler {
  stringify(obj: any) {
    return JSON.stringify(obj, function (key, value) {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: [...value]
        };
      } else {
        return value;
      }
    });
  }

  parse<T>(str: string): T {
    return JSON.parse(str, function reviver(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
      }
      return value;
    });
  }

  indexArray<T, K, V>(array: T[], predicateKey: (item: T) => K, predicateValue: (item: T) => V) {
    const map = new Map<K, V>();
    let key: K;
    let value: V;
    for (const item of array) {
      key = predicateKey(item);
      value = predicateValue(item);
      map.set(key, value);
    }
    return map;
  }

  distinctBy<T, K>(arr: T[], predicate: (a: T) => K) {
    let value;
    const container = new Set<K>();
    return arr.filter(x => {
      value = predicate(x);
      if (!container.has(value)) {
        container.add(value);
        return true;
      }
      return false;
    });
  }

  groupBy<T, K>(arr: T[], predicate: (a: T) => K) {
    const map = new Map<K, T[]>();
    let value: K;
    for (const item of arr) {
      value = predicate(item);
      if (!map.has(value)) {
        map.set(value, []);
      }
      map.get(value)!.push(item);
    }
    return map;
  }

  chunk<T>(arr: T[], chunkSize: number): T[][] {
    const ret: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      ret.push(chunk);
    }
    return ret;
  }
}
