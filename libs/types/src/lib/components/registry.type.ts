// Container registry associated interfaces

import { ComponentRef, Type, ViewContainerRef } from "@angular/core"

export interface ComponentContainerComponent {
	component: ComponentRef<Type<any>>,
	componentUID: string,
	containerId: string
}

export interface ContainerRegistry {
	containerId: string,
	container: ViewContainerRef,
	components: ComponentContainerComponent[]
}