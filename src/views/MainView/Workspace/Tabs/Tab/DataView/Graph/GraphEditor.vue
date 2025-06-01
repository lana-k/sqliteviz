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
        <Panel group="Style" name="Nodes">
          <Fold name="Nodes">
            <Field label="Label">
              <Dropdown
                :options="keysOptions"
                :value="settings.style.nodes.label.source"
                @change="updateNodes('label.source', $event)"
              />
            </Field>

            <Field label="Size">
              <RadioBlocks
                :options="nodeSizeTypeOptions"
                :activeOption="settings.style.nodes.size.type"
                @option-change="updateNodes('size.type', $event)"
              />

              <Field>
                <NumericInput
                  v-if="settings.style.nodes.size.type === 'constant'"
                  :value="settings.style.nodes.size.value"
                  :min="1"
                  @update="updateNodes('size.value', $event)"
                />
                <Dropdown
                  v-if="settings.style.nodes.size.type === 'variable'"
                  :options="keysOptions"
                  :value="settings.style.nodes.size.source"
                  @change="updateNodes('size.source', $event)"
                />
                <Dropdown
                  v-if="settings.style.nodes.size.type === 'calculated'"
                  :options="nodeCalculatedSizeMethodOptions"
                  :value="settings.style.nodes.size.method"
                  @change="updateNodes('size.method', $event)"
                />
              </Field>
            </Field>

            <template v-if="settings.style.nodes.size.type !== 'constant'">
              <Field label="Size scale">
                <NumericInput
                  :value="settings.style.nodes.size.scale"
                  @update="updateNodes('size.scale', $event)"
                />
              </Field>

              <Field label="Size mode">
                <RadioBlocks
                  :options="nodeSizeModeOptions"
                  :activeOption="settings.style.nodes.size.mode"
                  @option-change="updateNodes('size.mode', $event)"
                />
              </Field>

              <Field label="Minimum size">
                <NumericInput
                  :value="settings.style.nodes.size.min"
                  @update="updateNodes('size.min', $event)"
                />
              </Field>
            </template>

            <Field label="Color">
              <RadioBlocks
                :options="nodeColorTypeOptions"
                :activeOption="settings.style.nodes.color.type"
                @option-change="updateNodes('color.type', $event)"
              />
              <Field v-if="settings.style.nodes.color.type === 'constant'">
                <ColorPicker
                  :selectedColor="settings.style.nodes.color.value"
                  @color-change="updateNodes('color.value', $event)"
                />
              </Field>
              <template v-else>
                <Field>
                  <Dropdown
                    v-if="settings.style.nodes.color.type === 'variable'"
                    :options="keysOptions"
                    :value="settings.style.nodes.color.source"
                    @change="updateNodes('color.source', $event)"
                  />
                  <Dropdown
                    v-if="settings.style.nodes.color.type === 'calculated'"
                    :options="nodeCalculatedColorMethodOptions"
                    :value="settings.style.nodes.color.method"
                    @change="updateNodes('color.method', $event)"
                  />
                </Field>

                <Field>
                  <RadioBlocks
                    :options="colorSourceUsageOptions"
                    :activeOption="settings.style.nodes.color.sourceUsage"
                    @option-change="updateNodes('color.sourceUsage', $event)"
                  />
                </Field>

                <Field
                  v-if="settings.style.nodes.color.sourceUsage === 'map_to'"
                >
                  <ColorscalePicker
                    :selected="settings.style.nodes.color.colorscale"
                    className="colorscale-picker"
                    @colorscale-change="updateNodes('color.colorscale', $event)"
                  />
                </Field>
              </template>
            </Field>

            <Field
              v-if="settings.style.nodes.color.type !== 'constant'"
              label="Color as"
            >
              <RadioBlocks
                :options="сolorAsOptions"
                :activeOption="settings.style.nodes.color.mode"
                @option-change="updateNodes('color.mode', $event)"
              />
            </Field>

            <Field
              v-if="settings.style.nodes.color.type !== 'constant'"
              label="Colorscale direction"
            >
              <RadioBlocks
                :options="сolorscaleDirections"
                :activeOption="settings.style.nodes.color.colorscaleDirection"
                @option-change="
                  updateNodes('color.colorscaleDirection', $event)
                "
              />
            </Field>
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

            <Field label="Size">
              <RadioBlocks
                :options="edgeSizeTypeOptions"
                :activeOption="settings.style.edges.size.type"
                @option-change="updateEdges('size.type', $event)"
              />

              <Field>
                <NumericInput
                  v-if="settings.style.edges.size.type === 'constant'"
                  :value="settings.style.edges.size.value"
                  :min="1"
                  @update="updateEdges('size.value', $event)"
                />
                <Dropdown
                  v-if="settings.style.edges.size.type === 'variable'"
                  :options="keysOptions"
                  :value="settings.style.edges.size.source"
                  @change="updateEdges('size.source', $event)"
                />
              </Field>
            </Field>

            <template v-if="settings.style.edges.size.type !== 'constant'">
              <Field label="Size scale">
                <NumericInput
                  :value="settings.style.edges.size.scale"
                  @update="updateEdges('size.scale', $event)"
                />
              </Field>

              <Field label="Minimum size">
                <NumericInput
                  :value="settings.style.edges.size.min"
                  @update="updateEdges('size.min', $event)"
                />
              </Field>
            </template>

            <Field label="Color">
              <RadioBlocks
                :options="edgeColorTypeOptions"
                :activeOption="settings.style.edges.color.type"
                @option-change="updateEdges('color.type', $event)"
              />
              <Field v-if="settings.style.edges.color.type === 'constant'">
                <ColorPicker
                  :selectedColor="settings.style.edges.color.value"
                  @color-change="updateEdges('color.value', $event)"
                />
              </Field>
              <template v-else>
                <Field>
                  <Dropdown
                    v-if="settings.style.edges.color.type === 'variable'"
                    :options="keysOptions"
                    :value="settings.style.edges.color.source"
                    @change="updateEdges('color.source', $event)"
                  />
                </Field>

                <Field>
                  <RadioBlocks
                    :options="colorSourceUsageOptions"
                    :activeOption="settings.style.edges.color.sourceUsage"
                    @option-change="updateEdges('color.sourceUsage', $event)"
                  />
                </Field>

                <Field
                  v-if="settings.style.edges.color.sourceUsage === 'map_to'"
                >
                  <ColorscalePicker
                    :selected="settings.style.edges.color.colorscale"
                    className="colorscale-picker"
                    @colorscale-change="updateEdges('color.colorscale', $event)"
                  />
                </Field>
              </template>
            </Field>

            <Field
              v-if="settings.style.edges.color.type !== 'constant'"
              label="Color as"
            >
              <RadioBlocks
                :options="сolorAsOptions"
                :activeOption="settings.style.edges.color.mode"
                @option-change="updateEdges('color.mode', $event)"
              />
            </Field>

            <Field
              v-if="settings.style.edges.color.type !== 'constant'"
              label="Colorscale direction"
            >
              <RadioBlocks
                :options="сolorscaleDirections"
                :activeOption="settings.style.edges.color.colorscaleDirection"
                @option-change="
                  updateEdges('color.colorscaleDirection', $event)
                "
              />
            </Field>
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
        width: '100%'
      }"
    />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import GraphEditorControls from '@/lib/GraphEditorControls.jsx'
import { PanelMenuWrapper, Panel, Fold, Section } from 'react-chart-editor'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks'
import Button from 'react-chart-editor/lib/components/widgets/Button'
import ColorscalePicker from 'react-chart-editor/lib/components/widgets/ColorscalePicker'
import ColorPicker from 'react-chart-editor/lib/components/widgets/ColorPicker'
import Field from 'react-chart-editor/lib/components/fields/Field'
import RandomLayoutSettings from '@/components/Graph/RandomLayoutSettings.vue'
import ForceAtlasLayoutSettings from '@/components/Graph/ForceAtlasLayoutSettings.vue'
import CirclePackLayoutSettings from '@/components/Graph/CirclePackLayoutSettings.vue'
import 'react-chart-editor/lib/react-chart-editor.css'
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import RunIcon from '@/components/svg/run.vue'
import StopIcon from '@/components/svg/stop.vue'
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

export default {
  components: {
    GraphEditorControls: applyPureReactInVue(GraphEditorControls),
    PanelMenuWrapper: applyPureReactInVue(PanelMenuWrapper),
    Panel: applyPureReactInVue(Panel),
    PanelSection: applyPureReactInVue(Section),
    Dropdown: applyPureReactInVue(Dropdown),
    NumericInput: applyPureReactInVue(NumericInput),
    RadioBlocks: applyPureReactInVue(RadioBlocks),
    Field: applyPureReactInVue(Field),
    Fold: applyPureReactInVue(Fold),
    ColorscalePicker: applyPureReactInVue(ColorscalePicker),
    ColorPicker: applyPureReactInVue(ColorPicker),
    Button: applyPureReactInVue(Button),
    RunIcon,
    StopIcon,
    RandomLayoutSettings,
    CirclePackLayoutSettings
  },
  props: {
    dataSources: Object
  },
  data() {
    return {
      graph: new Graph(),
      renderer: null,
      fa2Layout: null,
      fa2Running: false,
      nodeSizeTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' },
        { label: 'Calculated', value: 'calculated' }
      ]),
      edgeSizeTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' }
      ]),
      nodeCalculatedSizeMethodOptions: markRaw([
        { label: 'Degree', value: 'degree' },
        { label: 'In degree', value: 'inDegree' },
        { label: 'Out degree', value: 'outDegree' }
      ]),
      nodeSizeModeOptions: markRaw([
        { label: 'Area', value: 'area' },
        { label: 'Diameter', value: 'diameter' }
      ]),
      nodeColorTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' },
        { label: 'Calculated', value: 'calculated' }
      ]),
      edgeColorTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' }
      ]),
      nodeCalculatedColorMethodOptions: markRaw([
        { label: 'Degree', value: 'degree' },
        { label: 'In degree', value: 'inDegree' },
        { label: 'Out degree', value: 'outDegree' }
      ]),
      сolorAsOptions: markRaw([
        { label: 'Continious', value: 'continious' },
        { label: 'Categorical', value: 'categorical' }
      ]),
      сolorscaleDirections: markRaw([
        { label: 'Normal', value: 'normal' },
        { label: 'Recersed', value: 'reversed' }
      ]),
      colorSourceUsageOptions: markRaw([
        { label: 'Direct', value: 'direct' },
        { label: 'Map to', value: 'map_to' }
      ]),
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

      settings: {
        structure: {
          nodeId: null,
          objectType: null,
          edgeSource: null,
          edgeTarget: null
        },
        style: {
          nodes: {
            size: {
              type: 'constant',
              value: 16,
              source: null,
              scale: 1,
              mode: 'diameter',
              method: 'degree',
              min: 0
            },
            color: {
              type: 'constant',
              value: '#1F77B4',
              source: null,
              sourceUsage: 'map_to',
              colorscale: null,
              colorscaleDirection: 'normal',
              method: 'degree',
              mode: 'continious'
            },
            label: {
              source: null
            }
          },
          edges: {
            showDirection: true,
            size: {
              type: 'constant',
              value: 2,
              source: null,
              scale: 1,
              min: 0
            },
            color: {
              type: 'constant',
              value: '#a2b1c6',
              source: null,
              sourceUsage: 'map_to',
              colorscale: null,
              colorscaleDirection: 'normal',
              mode: 'continious'
            },
            label: {
              source: null
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
      return this.dataSources[Object.keys(this.dataSources)[0] || 'doc'].map(
        json => JSON.parse(json)
      )
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
    'settings.structure': {
      deep: true,
      handler() {
        this.buildGraph()
      }
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
        allowInvalidContainer: true
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
