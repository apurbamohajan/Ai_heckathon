

export interface AvatarModel {

  url: string;

  credit: string;

  naturalHeight: number;

  label?: string;
}

const SOLDIER: AvatarModel = {
  url: 'https://threejs.org/examples/models/gltf/Soldier.glb',
  credit: 'three.js examples · Mixamo / Adobe · free for three.js examples',
  naturalHeight: 1.8,
  label: 'Soldier',
};


const MICHELLE: AvatarModel = {
  url: 'https://threejs.org/examples/models/gltf/Michelle.glb',
  credit: 'three.js examples · Mixamo / Adobe · free for three.js examples',
  naturalHeight: 1.7,
  label: 'Michelle',
};


const XBOT: AvatarModel = {
  url: 'https://threejs.org/examples/models/gltf/Xbot.glb',
  credit: 'three.js examples · Mixamo / Adobe · free for three.js examples',
  naturalHeight: 1.8,
  label: 'Xbot',
};


const RPM_COWBOY: AvatarModel = {
  url: 'https://threejs.org/examples/models/gltf/readyplayer.me.glb',
  credit: 'three.js examples · Ready Player Me · Ready Player Me Avatar Terms',
  naturalHeight: 1.75,
  label: 'RPM-Cowboy',
};


const CESIUM_MAN_LEGACY: AvatarModel = {
  url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb',
  credit: 'Khronos glTF Sample Models · Cesium / AGI · CC-BY 4.0',
  naturalHeight: 1.65,
  label: 'CesiumMan',
};


const CESIUM_MAN_NEW: AvatarModel = {
  url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb',
  credit: 'Khronos glTF Sample Assets · Cesium / AGI · CC-BY 4.0',
  naturalHeight: 1.65,
  label: 'CesiumMan-2',
};


const ROBOT_EXPRESSIVE: AvatarModel = {
  url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  credit: 'three.js examples · Tomás Laulhé / Don McCurdy · CC0',
  naturalHeight: 1.7,
  label: 'RobotExpressive',
};


export const AVATAR_POOLS: {
  adultMale: AvatarModel[];
  adultFemale: AvatarModel[];
  elderlyMale: AvatarModel[];
  elderlyFemale: AvatarModel[];
  child: AvatarModel[];
} = {

  adultMale: [SOLDIER, RPM_COWBOY],
  adultFemale: [MICHELLE, XBOT],
  elderlyMale: [SOLDIER, RPM_COWBOY],
  elderlyFemale: [MICHELLE, XBOT],

  child: [CESIUM_MAN_LEGACY, CESIUM_MAN_NEW, XBOT],
};


export const AVATAR_MODELS: {
  adultMale: AvatarModel;
  adultFemale: AvatarModel;
  elderlyMale: AvatarModel;
  elderlyFemale: AvatarModel;
  child: AvatarModel;
  /** Optional teen/young-adult slot — re-uses the adult rigs. */
  teen: AvatarModel;
} = {
  adultMale: AVATAR_POOLS.adultMale[0],
  adultFemale: AVATAR_POOLS.adultFemale[0],
  elderlyMale: AVATAR_POOLS.elderlyMale[0],
  elderlyFemale: AVATAR_POOLS.elderlyFemale[0],
  child: AVATAR_POOLS.child[0],
  teen: XBOT,
};


export const SITTING_FALLBACK_MODEL: AvatarModel = ROBOT_EXPRESSIVE;


function poolFor(age: number, gender: 'M' | 'F'): AvatarModel[] {
  if (age < 18) return AVATAR_POOLS.child;
  if (age >= 70) {
    return gender === 'F' ? AVATAR_POOLS.elderlyFemale : AVATAR_POOLS.elderlyMale;
  }
  return gender === 'F' ? AVATAR_POOLS.adultFemale : AVATAR_POOLS.adultMale;
}

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Force unsigned
  return h >>> 0;
}


export function pickAvatar(
  age: number,
  gender: 'M' | 'F',
  seed?: string,
): AvatarModel {
  const pool = poolFor(age, gender);
  if (pool.length === 0) {

    return MICHELLE;
  }
  if (seed === undefined) {
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  const bucketKey = `${age < 18 ? 'c' : age >= 70 ? 'e' : 'a'}${gender}`;
  const idx = hashString(`${bucketKey}:${seed}`) % pool.length;
  return pool[idx];
}

export const ALL_AVATAR_URLS: readonly string[] = Array.from(
  new Set<string>([
    ...AVATAR_POOLS.adultMale.map((m) => m.url),
    ...AVATAR_POOLS.adultFemale.map((m) => m.url),
    ...AVATAR_POOLS.elderlyMale.map((m) => m.url),
    ...AVATAR_POOLS.elderlyFemale.map((m) => m.url),
    ...AVATAR_POOLS.child.map((m) => m.url),
    SITTING_FALLBACK_MODEL.url,
  ]),
);


export default pickAvatar;
