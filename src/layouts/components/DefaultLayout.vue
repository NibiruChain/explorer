<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';
import Sponsors from '@/layouts/components/Sponsors.vue';

import { useDashboard } from '@/stores/useDashboard';
import { NetworkType } from '@/types/chaindata';
import { useBaseStore, useBlockchain } from '@/stores';

import NavBarI18n from './NavBarI18n.vue';
import NavBarWallet from './NavBarWallet.vue';
import type {
  NavGroup,
  NavLink,
  NavSectionTitle,
  VerticalNavItems,
} from '../types';
import dayjs from 'dayjs';
import AdBanner from '@/components/ad/AdBanner.vue';

const dashboard = useDashboard();
dashboard.initial();
const blockchain = useBlockchain();
blockchain.randomSetupEndpoint();
const baseStore = useBaseStore();

const current = ref(''); // the current chain
const temp = ref('');
blockchain.$subscribe((m, s) => {
  if (current.value === s.chainName && temp.value != s.endpoint.address) {
    temp.value = s.endpoint.address;
    blockchain.initial();
  }
  if (current.value != s.chainName) {
    current.value = s.chainName;
    blockchain.randomSetupEndpoint();
  }
});

const sidebarShow = ref(false);
const sidebarOpen = ref(true);

const changeOpen = (index: Number) => {
  if (index === 0) {
    sidebarOpen.value = !sidebarOpen.value;
  }
};
const showDiscord = window.location.host.search('ping.pub') > -1;

function isNavGroup(nav: VerticalNavItems | any): nav is NavGroup {
  return (<NavGroup>nav).children !== undefined;
}
function isNavLink(nav: VerticalNavItems | any): nav is NavLink {
  return (<NavLink>nav).to !== undefined;
}
function isNavTitle(nav: VerticalNavItems | any): nav is NavSectionTitle {
  return (<NavSectionTitle>nav).heading !== undefined;
}
function selected(route: any, nav: NavLink) {
  const b =
    route.path === nav.to?.path || (route.path.startsWith(nav.to?.path) && nav.title.indexOf('dashboard') === -1);
  return b;
}
const blocktime = computed(() => {
  return dayjs(baseStore.latest?.block?.header?.time);
});

const behind = computed(() => {
  const current = dayjs().subtract(10, 'minute');
  return blocktime.value.isBefore(current);
});

dayjs();

const show_ad = computed(() => {
  return location.hostname.indexOf('ping.pub') > -1;
});
</script>

<template>
  <div class="bg-gray-100 dark:bg-[#171d30]">
    <!-- sidebar -->
    <div
      class="w-64 fixed z-50 left-0 top-0 bottom-0 overflow-auto bg-base-100 border-r border-gray-100 dark:border-gray-700"
      :class="{ block: sidebarShow, 'hidden xl:!block': !sidebarShow }"
    >
      <div class="flex justify-between mt-1 pl-4 py-4 mb-1">
        <RouterLink to="/" class="flex items-center">
          <img class="w-10 h-10" src="../../assets/nibiru.svg" />
          <h1 class="flex-1 ml-3 text-2xl font-semibold dark:text-white">Nibiru</h1>
        </RouterLink>
        <div
          class="pr-4 cursor-pointer xl:!hidden"
          @click="sidebarShow = false"
        >
          <Icon icon="mdi-close" class="text-2xl" />
        </div>
      </div>
      <div v-for="(item, index) of blockchain.computedChainMenu" :key="index" class="px-2">
        <div
          v-if="isNavGroup(item)"
          :tabindex="index"
          class="collapse"
          :class="{
            'collapse-arrow': index > 0 && item?.children?.length > 0,
            'collapse-open': index === 0 && sidebarOpen,
            'collapse-close': index === 0 && !sidebarOpen,
          }"
        >
          <input v-if="index > 0" type="checkbox" class="cursor-pointer !h-10 block" @click="changeOpen(index)" />
          <div
            class="collapse-title !py-0 px-4 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
          >
            <Icon
              v-if="item?.icon?.icon"
              :icon="item?.icon?.icon"
              class="text-xl mr-2"
              :class="{
                'text-yellow-500': item?.title === 'Favorite',
                'text-blue-500': item?.title !== 'Favorite',
              }"
            />
            <img v-if="item?.icon?.image" :src="item?.icon?.image" class="w-6 h-6 rounded-full mr-3" />
            <div class="text-base capitalize flex-1 text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {{ item?.title }}
            </div>
            <div
              v-if="item?.badgeContent"
              class="mr-6 badge badge-sm text-white border-none"
              :class="item?.badgeClass"
            >
              {{ item?.badgeContent }}
            </div>
          </div>
          <div class="collapse-content">
            <div v-for="(el, key) of item?.children" class="menu bg-base-100 w-full !p-0">
              <RouterLink
                v-if="isNavLink(el)"
                @click="sidebarShow = false"
                class="hover:bg-gray-100 dark:hover:bg-[#373f59] rounded cursor-pointer px-3 py-2 flex items-center"
                :class="{
                  '!bg-primary': selected($route, el),
                }"
                :to="el.to"
              >
                <Icon
                  v-if="!el?.icon?.image"
                  icon="mdi:chevron-right"
                  class="mr-2 ml-3"
                  :class="{
                    'text-white': $route.path === el?.to?.path && item?.title !== 'Favorite',
                  }"
                />
                <img
                  v-if="el?.icon?.image"
                  :src="el?.icon?.image"
                  class="w-6 h-6 rounded-full mr-3 ml-4"
                  :class="{
                    'border border-gray-300 bg-white': selected($route, el),
                  }"
                />
                <div
                  class="text-base capitalize text-gray-500 dark:text-gray-300"
                  :class="{
                    '!text-white': selected($route, el),
                  }"
                >
                  {{ item?.title === 'Favorite' ? el?.title : $t(el?.title) }}
                </div>
              </RouterLink>
            </div>
            <div
              v-if="index === 0 && dashboard.networkType === NetworkType.Testnet"
              class="menu bg-base-100 w-full !p-0"
            >
              <RouterLink
                class="hover:bg-gray-100 dark:hover:bg-[#373f59] rounded cursor-pointer px-3 py-2 flex items-center"
                :to="`/${blockchain.chainName}/faucet`"
              >
                <Icon icon="mdi:chevron-right" class="mr-2 ml-3"></Icon>
                <div class="text-base capitalize text-gray-500 dark:text-gray-300">Faucet</div>
                <div class="badge badge-sm text-white border-none badge-error ml-auto">New</div>
              </RouterLink>
            </div>
          </div>
        </div>

        <RouterLink
          v-if="isNavLink(item)"
          :to="item?.to"
          @click="sidebarShow = false"
          class="cursor-pointer rounded-lg px-4 flex items-center py-2 hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon
            v-if="item?.icon?.icon"
            :icon="item?.icon?.icon"
            class="text-xl mr-2"
            :class="{
              'text-yellow-500': item?.title === 'Favorite',
              'text-blue-500': item?.title !== 'Favorite',
            }"
          />
          <img
            v-if="item?.icon?.image"
            :src="item?.icon?.image"
            class="w-6 h-6 rounded-full mr-3 border border-blue-100"
          />
          <div class="text-base capitalize flex-1 text-gray-700 dark:text-gray-200 whitespace-nowrap">
            {{ item?.title }}
          </div>
          <div
            v-if="item?.badgeContent"
            class="badge badge-sm text-white border-none"
            :class="item?.badgeClass"
          >
            {{ item?.badgeContent }}
          </div>
        </RouterLink>
        <div
          v-if="isNavTitle(item)"
          class="px-4 text-sm text-gray-400 pb-2 uppercase"
        >
          {{ item?.heading }}
        </div>
      </div>
      <div class="px-2">
        <div class="px-4 text-sm pt-2 text-gray-400 pb-2 uppercase">Tools</div>
        <RouterLink
          to="/wallet/suggest"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:frequently-asked-questions" class="text-xl mr-2" />
          <div class="text-base capitalize flex-1 text-gray-600 dark:text-gray-200">Wallet Helper</div>
        </RouterLink>
        <div
          v-if="showDiscord"
          class="px-4 text-sm pt-2 text-gray-400 pb-2 uppercase"
        >
          {{ $t('module.sponsors') }}
        </div>
        <Sponsors v-if="showDiscord" />
        <div class="px-4 text-sm pt-2 text-gray-400 pb-2 uppercase">{{ $t('module.links') }}</div>
        <a
          href="https://twitter.com/ping_pub"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:twitter" class="text-xl mr-2" />
          <div class="text-base capitalize flex-1 text-gray-600 dark:text-gray-200">Twitter</div>
        </a>
        <a
          v-if="showDiscord"
          href="https://discord.com/invite/CmjYVSr6GW"
          target="_blank"
          class="py-2 px-4 flex items-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:discord" class="text-xl mr-2" />
          <div class="text-base capitalize flex-1 text-gray-600 dark:text-gray-200">Discord</div>
        </a>
        <a
          href="https://github.com/ping-pub/explorer/discussions"
          target="_blank"
          class="py-2 px-4 flex items-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:frequently-asked-questions" class="text-xl mr-2" />
          <div class="text-base capitalize flex-1 text-gray-600 dark:text-gray-200">FAQ</div>
        </a>
      </div>
    </div>
    <div class="xl:!ml-64 px-3 pt-4">
      <!-- header -->
      <div
        class="flex items-center py-3 bg-base-100 mb-4 rounded px-4 sticky top-0 z-10"
      >
        <div
          class="text-2xl pr-3 cursor-pointer xl:!hidden"
          @click="sidebarShow = true"
        >
          <Icon icon="mdi-menu" />
        </div>

        <ChainProfile />

        <div class="flex-1 w-0"></div>

        <!-- <NavSearchBar />-->
        <NavBarI18n class="hidden md:!inline-block" />
        <NavbarThemeSwitcher class="!inline-block" />
        <NavbarSearch class="!inline-block" />
        <NavBarWallet />
      </div>

      <!-- 👉 Pages -->
      <div style="min-height: calc(100vh - 180px)">
        <div v-if="behind" class="alert alert-error mb-4">
          <div class="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span
              >{{ $t('pages.out_of_sync') }} {{ blocktime.format() }} ({{
                blocktime.fromNow()
              }})</span
            >
          </div>
        </div>
        <RouterView v-slot="{ Component }">
          <Transition mode="out-in">
            <div>
              <AdBanner v-if="show_ad" />
              <Component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </div>

      <newFooter />
    </div>
  </div>
</template>
