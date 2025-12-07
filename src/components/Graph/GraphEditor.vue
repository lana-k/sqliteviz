<template>
  <div :class="['plotly_editor', { with_controls: showViewSettings }]">
    <GraphEditorControls v-show="showViewSettings">
      <PanelMenuWrapper>
        <Panel group="Structure" name="Graph">
          <Fold name="Graph">
            <Field>
              Map your result set records to node and edge properties required
              to build a graph. Learn more about result set requirements in the
              <a href="https://sqliteviz.com/docs/graph/" target="_blank">
                documentation</a
              >.
            </Field>
            <Field label="Object type" ref="objectTypeField">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.objectType"
                className="test_object_type_select"
                @change="updateStructure('objectType', $event)"
              />
              <Field>
                A field indicating if the record is node (value&nbsp;0) or edge
                (value&nbsp;1).
              </Field>
            </Field>

            <Field label="Node Id">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.nodeId"
                className="test_node_id_select"
                @change="updateStructure('nodeId', $event)"
              />
              <Field> A field keeping unique node identifier. </Field>
            </Field>

            <Field label="Edge source">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.edgeSource"
                className="test_edge_source_select"
                @change="updateStructure('edgeSource', $event)"
              />
              <Field>
                A field keeping a node identifier where the edge starts.
              </Field>
            </Field>

            <Field label="Edge target">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.edgeTarget"
                className="test_edge_target_select"
                @change="updateStructure('edgeTarget', $event)"
              />
              <Field>
                A field keeping a node identifier where the edge ends.
              </Field>
            </Field>
          </Fold>
        </Panel>
        <Panel group="Style" name="General">
          <Fold name="General">
            <Field label="Background color">
              <ColorPicker
                :selectedColor="settings.style.backgroundColor"
                @color-change="settings.style.backgroundColor = $event"
              />
            </Field>
          </Fold>
        </Panel>
        <Panel group="Style" name="Nodes">
          <Fold name="Nodes">
            <Field label="Label">
              <Dropdown
                :options="keysOptions"
                :value="settings.style.nodes.label.source"
                className="test_label_select"
                @change="updateNodes('label.source', $event)"
              />
            </Field>

            <Field label="Label color">
              <ColorPicker
                :selectedColor="settings.style.nodes.label.color"
                @color-change="updateNodes('label.color', $event)"
              />
            </Field>

            <NodeSizeSettings
              v-model="settings.style.nodes.size"
              :keyOptions="keysOptions"
              @update:model-value="updateNodes('size', $event)"
            />
            <NodeColorSettings
              v-model="settings.style.nodes.color"
              :keyOptions="keysOptions"
              @update:model-value="updateNodes('color', $event)"
            />
          </Fold>
        </Panel>

        <Panel group="Style" name="Edges">
          <Fold name="Edges">
            <Field
              label="Direction"
              fieldContainerClassName="test_edge_direction"
            >
              <RadioBlocks
                :options="visibilityOptions"
                :activeOption="settings.style.edges.showDirection"
                @option-change="updateEdges('showDirection', $event)"
              />
            </Field>

            <Field label="Label">
              <Dropdown
                :options="keysOptions"
                :value="settings.style.edges.label.source"
                className="test_edge_label_select"
                @change="updateEdges('label.source', $event)"
              />
            </Field>

            <Field label="Label color">
              <ColorPicker
                :selectedColor="settings.style.edges.label.color"
                @color-change="updateEdges('label.color', $event)"
              />
            </Field>

            <EdgeSizeSettings
              v-model="settings.style.edges.size"
              :keyOptions="keysOptions"
              @update:model-value="updateEdges('size', $event)"
            />

            <EdgeColorSettings
              v-model="settings.style.edges.color"
              :keyOptions="keysOptions"
              @update:model-value="updateEdges('color', $event)"
            />
          </Fold>
        </Panel>
        <Panel group="Style" name="Layout">
          <Fold name="Layout">
            <Field label="Algorithm">
              <Dropdown
                :options="layoutOptions"
                :value="settings.layout.type"
                :clearable="false"
                @change="updateLayout($event)"
              />
            </Field>
            <component
              :is="layoutSettingsComponentMap[settings.layout.type]"
              v-if="settings.layout.type !== 'circular'"
              v-model="settings.layout.options"
              :keyOptions="keysOptions"
              @update:model-value="updateLayout(settings.layout.type)"
            />
          </Fold>
          <template v-if="settings.layout.type === 'forceAtlas2'">
            <Fold name="Advanced layout settings">
              <AdvancedForceAtlasLayoutSettings
                v-model="settings.layout.options"
                :keyOptions="keysOptions"
                @update:model-value="updateLayout(settings.layout.type)"
              />
            </Fold>
            <div class="force-atlas-buttons">
              <Button variant="secondary" @click="resetFA2LayoutSettings">
                Reset
              </Button>
              <Button variant="primary" @click="toggleFA2Layout">
                <template #node:icon>
                  <div
                    :style="{
                      padding: '0 3px'
                    }"
                  >
                    <RunIcon v-if="!fa2Running" />
                    <StopIcon v-else />
                  </div>
                </template>
                {{ fa2Running ? 'Stop' : 'Start' }}
              </Button>
            </div>
          </template>
        </Panel>
      </PanelMenuWrapper>
    </GraphEditorControls>

    <div
      ref="graph"
      class="test_graph_output"
      :style="{
        height: '100%',
        width: '100%',
        backgroundColor: settings.style.backgroundColor
      }"
    />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import GraphEditorControls from '@/lib/GraphEditorControls.jsx'
import { PanelMenuWrapper, Panel, Fold, Section } from 'react-chart-editor'
import 'react-chart-editor/lib/react-chart-editor.css'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks'
import ColorPicker from 'react-chart-editor/lib/components/widgets/ColorPicker'
import Button from 'react-chart-editor/lib/components/widgets/Button'
import Field from 'react-chart-editor/lib/components/fields/Field'
import RandomLayoutSettings from '@/components/Graph/RandomLayoutSettings.vue'
import ForceAtlasLayoutSettings from '@/components/Graph/ForceAtlasLayoutSettings.vue'
import AdvancedForceAtlasLayoutSettings from '@/components/Graph/AdvancedForceAtlasLayoutSettings.vue'
import CirclePackLayoutSettings from '@/components/Graph/CirclePackLayoutSettings.vue'
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import RunIcon from '@/components/svg/run.vue'
import StopIcon from '@/components/svg/stop.vue'
import { downloadAsPNG, drawOnCanvas } from '@sigma/export-image'
import {
  buildNodes,
  buildEdges,
  updateNodes,
  updateEdges
} from '@/lib/graphHelper'
import Graph from 'graphology'
import { circular, random, circlepack } from 'graphology-layout'
import Sigma from 'sigma'
import seedrandom from 'seedrandom'
import NodeColorSettings from '@/components/Graph/NodeColorSettings.vue'
import NodeSizeSettings from '@/components/Graph/NodeSizeSettings.vue'
import EdgeSizeSettings from '@/components/Graph/EdgeSizeSettings.vue'
import EdgeColorSettings from '@/components/Graph/EdgeColorSettings.vue'
import events from '@/lib/utils/events'

export default {
  components: {
    GraphEditorControls: applyPureReactInVue(GraphEditorControls),
    PanelMenuWrapper: applyPureReactInVue(PanelMenuWrapper),
    Panel: applyPureReactInVue(Panel),
    PanelSection: applyPureReactInVue(Section),
    Dropdown: applyPureReactInVue(Dropdown),
    RadioBlocks: applyPureReactInVue(RadioBlocks),
    Field: applyPureReactInVue(Field),
    Fold: applyPureReactInVue(Fold),
    Button: applyPureReactInVue(Button),
    ColorPicker: applyPureReactInVue(ColorPicker),
    RunIcon,
    StopIcon,
    RandomLayoutSettings,
    CirclePackLayoutSettings,
    NodeColorSettings,
    NodeSizeSettings,
    EdgeSizeSettings,
    EdgeColorSettings,
    AdvancedForceAtlasLayoutSettings
  },
  inject: ['tabLayout'],
  props: {
    dataSources: Object,
    initOptions: Object,
    showViewSettings: Boolean
  },
  emits: ['update'],
  data() {
    return {
      graph: new Graph({ multi: true, allowSelfLoops: true }),
      renderer: null,
      fa2Layout: null,
      fa2Running: false,
      checkIteration: null,
      visibilityOptions: markRaw([
        { label: 'Show', value: true },
        { label: 'Hide', value: false }
      ]),
      layoutOptions: markRaw([
        { label: 'Circular', value: 'circular' },
        { label: 'Random', value: 'random' },
        { label: 'Circle pack', value: 'circlepack' },
        { label: 'ForceAtlas2', value: 'forceAtlas2' }
      ]),
      layoutSettingsComponentMap: markRaw({
        random: RandomLayoutSettings,
        circlepack: CirclePackLayoutSettings,
        forceAtlas2: ForceAtlasLayoutSettings
      }),

      settings: this.initOptions
        ? JSON.parse(JSON.stringify(this.initOptions))
        : {
            structure: {
              nodeId: null,
              objectType: null,
              edgeSource: null,
              edgeTarget: null
            },
            style: {
              backgroundColor: 'white',
              nodes: {
                size: {
                  type: 'constant',
                  value: 10
                },
                color: {
                  type: 'constant',
                  value: '#1F77B4'
                },
                label: {
                  source: null,
                  color: '#444444'
                }
              },
              edges: {
                showDirection: true,
                size: {
                  type: 'constant',
                  value: 2
                },
                color: {
                  type: 'constant',
                  value: '#a2b1c6'
                },
                label: {
                  source: null,
                  color: '#a2b1c6'
                }
              }
            },
            layout: {
              type: 'circular',
              options: null
            }
          },
      layoutOptionsArchive: {
        random: null,
        circlepack: null,
        forceAtlas2: null
      }
    }
  },
  computed: {
    records() {
      if (!this.dataSources) {
        return []
      }
      const firstColumnName = Object.keys(this.dataSources)[0]
      try {
        return (
          this.dataSources[firstColumnName].map(json => JSON.parse(json)) || []
        )
      } catch {
        return []
      }
    },
    keysOptions() {
      if (!this.dataSources) {
        return []
      }
      const keySet = this.records.reduce((result, currentRecord) => {
        Object.keys(currentRecord).forEach(key => result.add(key))
        return result
      }, new Set())

      return Array.from(keySet)
    }
  },
  watch: {
    dataSources() {
      if (this.dataSources) {
        this.buildGraph()
      }
    },
    settings: {
      deep: true,
      handler() {
        this.$emit('update')
      }
    },
    'settings.structure': {
      deep: true,
      handler() {
        this.buildGraph()
      }
    },
    'settings.layout.type': {
      immediate: true,
      handler() {
        events.send('viz_graph.render', null, {
          layout: this.settings.layout.type
        })
      }
    },
    tabLayout: {
      deep: true,
      handler() {
        if (this.tabLayout.dataView !== 'hidden' && this.renderer) {
          this.renderer.scheduleRender()
        }
      }
    }
  },
  mounted() {
    if (this.dataSources) {
      this.buildGraph()
    }
  },
  methods: {
    buildGraph() {
      if (this.renderer) {
        this.renderer.kill()
      }
      this.graph.clear()

      buildNodes(this.graph, this.dataSources, this.settings)
      buildEdges(this.graph, this.dataSources, this.settings)

      // Apply visual settings
      updateNodes(this.graph, this.settings.style.nodes)
      updateEdges(this.graph, this.settings.style.edges)

      this.updateLayout(this.settings.layout.type)
      this.renderer = new Sigma(this.graph, this.$refs.graph, {
        renderEdgeLabels: true,
        allowInvalidContainer: true
      })
      if (this.settings.layout.type === 'forceAtlas2') {
        this.autoRunFA2Layout()
      }
    },
    updateStructure(attributeName, value) {
      this.settings.structure[attributeName] = value
    },
    updateNodes(attributeName, value) {
      const attributePath = attributeName.split('.')
      attributePath.reduce((result, current, index) => {
        if (index === attributePath.length - 1) {
          return (result[current] = value)
        } else {
          return result[current]
        }
      }, this.settings.style.nodes)

      updateNodes(this.graph, {
        [attributePath[0]]: this.settings.style.nodes[attributePath[0]]
      })
    },
    updateEdges(attributeName, value) {
      const attributePath = attributeName.split('.')
      attributePath.reduce((result, current, index) => {
        if (index === attributePath.length - 1) {
          return (result[current] = value)
        } else {
          return result[current]
        }
      }, this.settings.style.edges)

      updateEdges(this.graph, {
        [attributePath[0]]: this.settings.style.edges[attributePath[0]]
      })
    },
    updateLayout(layoutType) {
      const prevLayout = this.settings.layout.type

      // Change layout type? - restore layout settings or set default settings
      if (layoutType !== prevLayout) {
        this.layoutOptionsArchive[prevLayout] = this.settings.layout.options
        this.settings.layout.options = this.layoutOptionsArchive[layoutType]

        if (!this.settings.layout.options) {
          if (layoutType === 'forceAtlas2') {
            this.setRecommendedFA2Settings()
          } else if (['random', 'circlepack'].includes(layoutType)) {
            this.settings.layout.options = {
              seedValue: 1
            }
          }
        }
        this.settings.layout.type = layoutType
      }

      // In any case kill FA2 if it exists
      if (this.fa2Layout) {
        if (this.fa2Layout.isRunning()) {
          this.stopFA2Layout()
        }
        this.fa2Layout.kill()
      }

      if (layoutType === 'circular') {
        circular.assign(this.graph)
        return
      }

      if (layoutType === 'random') {
        random.assign(this.graph, {
          rng: seedrandom(this.settings.layout.options.seedValue || 1)
        })
        return
      }

      if (layoutType === 'circlepack') {
        this.graph.forEachNode(nodeId => {
          this.graph.updateNode(nodeId, attributes => {
            const newAttributes = { ...attributes }
            // Delete old hierarchy attributes
            Object.keys(newAttributes)
              .filter(key => key.startsWith('hierarchyAttribute'))
              .forEach(
                hierarchyAttributeKey =>
                  delete newAttributes[hierarchyAttributeKey]
              )
            // Set new hierarchy attributes
            this.settings.layout.options.hierarchyAttributes?.forEach(
              (hierarchyAttribute, index) => {
                newAttributes['hierarchyAttribute' + index] =
                  attributes.data[hierarchyAttribute]
              }
            )

            return newAttributes
          })
        })

        circlepack.assign(this.graph, {
          hierarchyAttributes:
            this.settings.layout.options.hierarchyAttributes?.map(
              (_, index) => 'hierarchyAttribute' + index
            ) || [],
          rng: seedrandom(this.settings.layout.options.seedValue || 1)
        })
        return
      }

      if (layoutType === 'forceAtlas2') {
        if (
          !this.graph.someNode(
            (nodeKey, attributes) =>
              typeof attributes.x === 'number' &&
              typeof attributes.y === 'number'
          )
        ) {
          circular.assign(this.graph)
        }

        this.fa2Layout = markRaw(
          new FA2Layout(this.graph, {
            getEdgeWeight: (_, attr) =>
              this.settings.layout.options.weightSource
                ? attr.data[this.settings.layout.options.weightSource]
                : 1,
            settings: this.settings.layout.options
          })
        )
        if (layoutType !== prevLayout) {
          this.autoRunFA2Layout()
        }
      }
    },
    toggleFA2Layout() {
      if (this.fa2Layout.isRunning()) {
        this.stopFA2Layout()
      } else {
        this.fa2Running = true
        this.fa2Layout.start()
      }
    },
    stopFA2Layout() {
      this.fa2Running = false
      this.fa2Layout.stop()
      if (this.checkIteration) {
        this.fa2Layout.worker.removeEventListener(
          'message',
          this.checkIteration
        )
        this.checkIteration = null
      }
    },
    autoRunFA2Layout() {
      if (this.fa2Layout.isRunning()) {
        this.stopFA2Layout()
      }

      let iteration = 1
      this.checkIteration = () => {
        if (
          iteration === this.settings.layout.options.initialIterationsAmount
        ) {
          this.stopFA2Layout()
        }
        iteration++
      }
      this.fa2Layout.worker.addEventListener('message', this.checkIteration)
      this.fa2Running = true
      this.fa2Layout.start()
    },
    setRecommendedFA2Settings() {
      const sensibleSettings = forceAtlas2.inferSettings(this.graph)
      this.settings.layout.options = {
        initialIterationsAmount: 50,
        adjustSizes: false,
        barnesHutOptimize: false,
        barnesHutTheta: 0.5,
        edgeWeightInfluence: 0,
        gravity: 1,
        linLogMode: false,
        outboundAttractionDistribution: false,
        scalingRatio: 1,
        slowDown: 1,
        strongGravityMode: false,
        ...sensibleSettings
      }
      if (
        [Infinity, -Infinity].includes(this.settings.layout.options.slowDown)
      ) {
        this.settings.layout.options.slowDown = 1
      }
    },
    resetFA2LayoutSettings() {
      if (this.initOptions?.layout.type === 'forceAtlas2') {
        this.settings.layout = JSON.parse(
          JSON.stringify(this.initOptions.layout)
        )
      } else {
        this.setRecommendedFA2Settings()
      }
      this.updateLayout(this.settings.layout.type)
    },
    saveAsPng() {
      return downloadAsPNG(this.renderer, {
        backgroundColor: this.settings.style.backgroundColor
      })
    },
    prepareCopy() {
      return drawOnCanvas(this.renderer, {
        backgroundColor: this.settings.style.backgroundColor
      })
    }
  }
}
</script>

<style scoped>
.plotly_editor.with_controls > div {
  display: flex !important;
}

:deep(.customPickerContainer) {
  float: right;
}
.force-atlas-buttons {
  display: flex;
  width: 100%;
  gap: 16px;
}

.force-atlas-buttons :deep(button) {
  flex-grow: 1;
  flex-basis: 0;
}
</style>
