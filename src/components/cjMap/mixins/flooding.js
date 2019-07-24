import _ from "lodash"
import grids from '../../../../static/jsons/floodAll';
export default {
  data() {
    return {
      speed: 2000,
      timeInterval: null,
      sortGroupGrids: null,
      waterEntities: null,
      colors1: {
        1: "#A6FF00",
        2: "#82F630",
        3: "#52F13A",
        4: "#1DEC40",
        5: "#22DE31",
        6: "#33CD32"
      },
      colors: {
        1: "rgba(166,255,0,0.4)",
        2: "rgba(130,246,48,0.4)",
        3: "rgba(82,241,58,0.4)",
        4: "rgba(29,236,64,0.4)",
        5: "rgba(34,222,49,0.4)",
        6: "rgba(51,205,50,0.4)"
      }
    };
  },
  computed: {},
  methods: {
    replayFlooding() {
      //删除primitives
      this.Viewer.scene.primitives.removeAll();
      //清楚计时器
      window.clearInterval(this.timeInterval)
      this.intervalSetting(this.sortGroupGrids)
    },
    beginFlooding() {
      console.log('grids: ', grids);
      this.sortGroupGrids = this.praseData(grids.features);
      console.log('sortGroupGrids: ', this.sortGroupGrids);
      if (this.sortGroupGrids) {
        this.intervalSetting(this.sortGroupGrids)
      }
    },
    endFlooding() {},
    intervalSetting(sortGroupGrids) {
      let arrivalIndex = 0;
      this.timeInterval = setInterval(() => {
        if (arrivalIndex == sortGroupGrids.length) { //sortGroupGrids.length - 1
          window.clearInterval(this.timeInterval)
        } else {
          this.drawPrimitives(sortGroupGrids[arrivalIndex])
          console.log('sortGroupGrids[arrivalIndex]: ', sortGroupGrids[arrivalIndex]);
        }
        arrivalIndex++;
      }, this.speed);
    },
    praseData(data) {
      let sort = _.groupBy(_.sortBy(data, (o) => {
          return o.properties.Value_1
        }), (a) => {
          return a.properties.Value_1
        }),
        sortGroupGrids = [];
      if (sort) {
        for (const key in sort) {
          if (sort.hasOwnProperty(key)) {
            sortGroupGrids.push(sort[key]);
          }
        }
        return sortGroupGrids
      }
    },
    drawPrimitives(features) {
      let instanceArray = [];
      features.forEach(v => {
        let id = v.properties.GridID,
          color = this.colors[v.properties.color],
          // color = "#FF0000",
          degreesArry = [];
        if (v.geometry.type == 'MultiPolygon') {
          v.geometry.coordinates.forEach(vv => {
            degreesArry = vv[0].reduce((pre, cur) => {
              return pre.concat(cur);
            }, []);
            instanceArray.push(this.createPolygonGeometryInstance(id, color, degreesArry))
          })
        } else {
          degreesArry = v.geometry.coordinates[0].reduce((pre, cur) => {
            return pre.concat(cur);
          }, []);
          instanceArray.push(this.createPolygonGeometryInstance(id, color, degreesArry))
        }
      })
      this.addPrimitivesToScene(this.Viewer, instanceArray)
    },

    addPrimitivesToScene(viewer, instanceArray) {
      viewer.scene.primitives.add(new Cesium.Primitive({
        // 用数组方式可以添加多个实例
        geometryInstances: instanceArray,
        // 几何外观根据自身的属性来设置
        appearance: new Cesium.PerInstanceColorAppearance()
      }))
      viewer.camera.zoomIn(0.005)
    },
    createPolygonGeometryInstance(id, color, degreesArry) {
      return new Cesium.GeometryInstance({
        id: id,
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(degreesArry)
          ),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(color)
          )
        }
      });
    },
    draw(features) {
      features.forEach(v => {
        // let color = this.colors[v.properties.color];
        let color = Cesium.Color.BLUE
        if (v.geometry.type == 'MultiPolygon') {
          v.geometry.coordinates.forEach(vv => {
            let cords = vv[0].reduce((pre, cur) => {
              return pre.concat(cur);
            }, []);
            this.addPolygonEntitys(this.Viewer, cords, color);
          })
        } else {
          let cords = v.geometry.coordinates[0].reduce((pre, cur) => {
            return pre.concat(cur);
          }, []);
          this.addPolygonEntitys(this.Viewer, cords, color);
        }
      })

    },
    addPolygonEntitys(viewer, cords, color) {
      viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(cords),
          material: color,
          // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
    },
    _drawWater(targetHeight, adapCoordi) {
      // this.earth.entities.remove(this.waterEntities)
      let entity = this.earth.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adapCoordi),
          material: new GV.Color.fromBytes(64, 157, 253, 150),
          perPositionHeight: true,
          extrudedHeight: 0.0
          // closeBottom:false
        }
      });
      this.waterEntities = entity;
      let waterHeight = adapCoordi[2];
      // this.earth.clock.onTick.addEventListener((clock)=> {
      //     waterHeight++
      //     entity.polygon.extrudedHeight.setValue(waterHeight)
      // })
      this.timeInterval = setInterval(() => {
        if (waterHeight < targetHeight) {
          waterHeight += 100;
          if (waterHeight > targetHeight) {
            waterHeight = targetHeight;
          }
          entity.polygon.extrudedHeight.setValue(waterHeight);
        }
      }, 100);
      this.entities.push(entity);
    }
  }
};
