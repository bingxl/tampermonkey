import { Base } from "./Base"
import { Ak } from "./Ak"
import { Diyibanzhu } from "./Diyibanzhu"
import { Hotu } from "./Hotu"
import { Lang } from "./Lang"
import { Tianya } from "./Tianya"
import { TianyaWx } from "./TianyaWx"
import { Wfxs } from "./Wfxs"
import { Xhszw } from "./Xhszw"
import { DiyibanzhuMe } from "./Diyibanzhume"

export const sites: typeof Base[] = [
    Lang,
    Ak,
    Diyibanzhu,
    Hotu,
    Xhszw,
    Wfxs,
    Tianya,
    TianyaWx,
    DiyibanzhuMe,
]