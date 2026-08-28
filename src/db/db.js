import AsyncStorage from '@react-native-async-storage/async-storage';

class MockDBStore {
  constructor(storeName) {
    this.storeName = storeName;
  }

  async _getData() {
    const data = await AsyncStorage.getItem(`@db_${this.storeName}`);
    return data ? JSON.parse(data) : [];
  }

  async toArray() {
    return await this._getData();
  }

  async _saveData(data) {
    await AsyncStorage.setItem(`@db_${this.storeName}`, JSON.stringify(data));
  }

  async get(id) {
    const data = await this._getData();
    return data.find(item => item.patient_id === id || item.id === id);
  }

  async add(item) {
    const data = await this._getData();
    item.id = Date.now().toString(); // mock auto-increment
    data.push(item);
    await this._saveData(data);
    return item;
  }

  async put(item) {
    const data = await this._getData();
    const index = data.findIndex(i => i.patient_id === item.patient_id || i.id === item.id);
    if (index >= 0) {
      data[index] = item;
    } else {
      data.push(item);
    }
    await this._saveData(data);
  }

  async delete(id) {
    const data = await this._getData();
    const filtered = data.filter(i => i.patient_id !== id && i.id !== id);
    await this._saveData(filtered);
  }

  where(field) {
    return {
      equals: (value) => {
        return {
          reverse: () => {
            return {
              limit: (lim) => {
                return {
                  toArray: async () => {
                    const data = await this._getData();
                    const filtered = data.filter(i => i[field] === value);
                    return filtered.reverse().slice(0, lim);
                  }
                };
              },
              toArray: async () => {
                const data = await this._getData();
                const filtered = data.filter(i => i[field] === value);
                return filtered.reverse();
              }
            }
          },
          toArray: async () => {
            const data = await this._getData();
            return data.filter(i => i[field] === value);
          }
        }
      }
    };
  }
}

export const db = {
  patients: new MockDBStore('patients'),
  cognitive_profiles: new MockDBStore('cognitive_profiles'),
  game_sessions: new MockDBStore('game_sessions'),
  daily_plans: new MockDBStore('daily_plans'),
  insights: new MockDBStore('insights'),
  sync_queue: new MockDBStore('sync_queue'),
};

export async function resetDatabase() {
  await AsyncStorage.clear();
}
