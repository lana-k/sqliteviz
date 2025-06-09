<template>
  <div class="plotly_editor">
    <GraphEditorControls>
      <PanelMenuWrapper>
        <Panel group="Structure" name="Graph">
          <Fold name="Graph">
            <Field>Choose keys explanation...</Field>
            <Field label="Object type">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.objectType"
                @change="updateStructure('objectType', $event)"
              />
              <Field>0 - node; 1 - edge</Field>
            </Field>

            <Field label="Node Id">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.nodeId"
                @change="updateStructure('nodeId', $event)"
              />
            </Field>

            <Field label="Edge source">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.edgeSource"
                @change="updateStructure('edgeSource', $event)"
              />
            </Field>

            <Field label="Edge target">
              <Dropdown
                :options="keysOptions"
                :value="settings.structure.edgeTarget"
                @change="updateStructure('edgeTarget', $event)"
              />
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
            <Field label="Direction">
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

            <Field v-if="settings.layout.type === 'forceAtlas2'">
              <Button variant="primary" @click="toggleFA2Layout">
                <template #node:icon>
                  <div
                    :style="{
                      padding: '0 3px'
                    }"
                  >
                    <RunIcon v-if="!fa2Running" />
                    <StopIcon v-else /></div
                ></template>
                {{ fa2Running ? 'Stop' : 'Start' }}
              </Button>
            </Field>
          </Fold>
        </Panel>
      </PanelMenuWrapper>
    </GraphEditorControls>
    <div
      ref="graph"
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
    EdgeColorSettings
  },
  inject: ['tabLayout'],
  props: {
    dataSources: Object,
    initOptions: Object
  },
  emits: ['update'],
  data() {
    return {
      graph: new Graph(),
      renderer: null,
      fa2Layout: null,
      fa2Running: false,
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

      settings: this.initOptions || {
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
              value: 4
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
      try {
        return (
          this.dataSources[Object.keys(this.dataSources)[0] || 'doc'].map(
            json => JSON.parse(json)
          ) || []
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

      circular.assign(this.graph)
      this.renderer = new Sigma(this.graph, this.$refs.graph, {
        renderEdgeLabels: true,
        allowInvalidContainer: true,
        labelColor: { attribute: 'labelColor', color: '#444444' },
        edgeLabelColor: { attribute: 'labelColor', color: '#a2b1c6' }
      })
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
      if (layoutType !== this.settings.layout.type) {
        const prevLayout = this.settings.layout.type
        this.layoutOptionsArchive[prevLayout] = this.settings.layout.options
        this.settings.layout.options = this.layoutOptionsArchive[layoutType]

        if (layoutType === 'forceAtlas2' && !this.settings.layout.options) {
          const sensibleSettings = forceAtlas2.inferSettings(this.graph)
          this.settings.layout.options = {
            adjustSizes: false,
            barnesHutOptimize: false,
            barnesHutTheta: 0.5,
            edgeWeightInfluence: 1,
            gravity: 1,
            linLogMode: false,
            outboundAttractionDistribution: false,
            scalingRatio: 1,
            slowDown: 1,
            strongGravityMode: false,
            ...sensibleSettings
          }
        } else if (layoutType === 'random' && !this.settings.layout.options) {
          this.settings.layout.options = {
            seedValue: 1
          }
        } else if (
          layoutType === 'circlepack' &&
          !this.settings.layout.options
        ) {
          this.settings.layout.options = {
            seedValue: 1
          }
        }
        this.settings.layout.type = layoutType
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
        if (this.fa2Layout) {
          this.fa2Layout.kill()
        }
        this.fa2Layout = markRaw(
          new FA2Layout(this.graph, {
            getEdgeWeight: (_, attr) =>
              attr.data[this.settings.layout.options.weightSource || 'weight'],
            settings: this.settings.layout.options
          })
        )
      }
    },
    toggleFA2Layout() {
      if (this.fa2Layout.isRunning()) {
        this.fa2Running = false
        this.fa2Layout.stop()
      } else {
        this.fa2Running = true
        this.fa2Layout.start()
      }
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
.plotly_editor > div {
  display: flex !important;
}

:deep(.customPickerContainer) {
  float: right;
}
</style>
