import React, { useCallback, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { DispatchFunction } from 'vtex.product-context/ProductDispatchContext'
import { ProductContext } from 'vtex.product-context'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import DropdownProductQuantity from './DropdownProductQuantity'
import StepperProductQuantity from './StepperProductQuantity'
import { getDefaultSeller } from '../helpers/getDefaultSeller'
import { getLimitedProducts } from '../helpers/getLimitedProducts'

export type NumericSize = 'small' | 'regular' | 'large'
export type SelectorType = 'stepper' | 'dropdown'
export type QuantitySelectorStepType = 'unitMultiplier' | 'singleUnit'

export interface BaseProps {
  dispatch: DispatchFunction
  selectedItem?: ProductContext['selectedItem']
  showLabel?: boolean
  selectedQuantity: number
  selectorType?: SelectorType
  size?: NumericSize
  warningQuantityThreshold: number
  showUnit: boolean
  quantitySelectorStep?: QuantitySelectorStepType
  limitMaxQuantityFromMD: Boolean
  entityToGetLimitedProducts: string
}

const CSS_HANDLES = [
  'quantitySelectorContainer',
  'quantitySelectorTitle',
  'availableQuantityContainer',
] as const

export type OnChangeCallback = {
  value: number
}

const BaseProductQuantity: StorefrontFunctionComponent<BaseProps> = ({
  dispatch,
  selectedItem,
  size = 'small',
  showLabel = true,
  selectedQuantity,
  warningQuantityThreshold = 0,
  selectorType = 'stepper',
  showUnit = true,
  quantitySelectorStep = 'unitMultiplier',
  limitMaxQuantityFromMD = false,
  entityToGetLimitedProducts = 'LP'  
}) => {
  const handles = useCssHandles(CSS_HANDLES)  
  const onChange = useCallback(
    (e: OnChangeCallback) => {
      dispatch({ type: 'SET_QUANTITY', args: { quantity: e.value } })
    },
    [dispatch]
  )
  const { orderForm } = useOrderForm()
  const productInOrder = orderForm.items.find((item:any) => item.id === selectedItem?.itemId)

  const seller = getDefaultSeller(selectedItem?.sellers)
  const availableQuantity = seller?.commertialOffer?.AvailableQuantity ?? 0

  const [ maxQuantity, setMaxQuantity ] = useState(availableQuantity)

  useEffect(() => {
    if (!selectedItem) return
    
    if (limitMaxQuantityFromMD){
      getLimitedProducts(entityToGetLimitedProducts, selectedItem.itemId)
      .then((data) => {
        if(!data?.length || !data[0]?.cantidad){
          setMaxQuantity(availableQuantity)
          return
        }

        const maxQtyFromMD = parseInt(data[0]?.cantidad)
        const qtyToCompare = availableQuantity > maxQtyFromMD ? maxQtyFromMD : availableQuantity
        if (productInOrder){          
          const newQty = qtyToCompare - productInOrder.quantity > 0 ? qtyToCompare - productInOrder.quantity : 1
          setMaxQuantity(newQty)
        } else {
          setMaxQuantity(qtyToCompare)
        }
      })
    } else{
      setMaxQuantity(availableQuantity)
    }
  }, [orderForm, selectedItem])

  if (availableQuantity < 1 || !selectedItem) {
    return null
  }

  const showAvailable = availableQuantity <= warningQuantityThreshold
  const unitMultiplier =
    quantitySelectorStep === 'singleUnit' ? 1 : selectedItem.unitMultiplier

  return (
    <div
      className={`${handles.quantitySelectorContainer} flex flex-column mb4`}>
      {showLabel && (
        <div
          className={`${handles.quantitySelectorTitle} mb3 c-muted-2 t-body`}>
          <FormattedMessage id="store/product-quantity.quantity" />
        </div>
      )}
      {selectorType === 'stepper' && (
        <StepperProductQuantity
          showUnit={showUnit}
          size={size}
          unitMultiplier={unitMultiplier}
          measurementUnit={selectedItem.measurementUnit}
          selectedQuantity={selectedQuantity}
          availableQuantity={maxQuantity}
          onChange={onChange}
        />
      )}
      {selectorType === 'dropdown' && (
        <DropdownProductQuantity
          itemId={selectedItem.itemId}
          selectedQuantity={selectedQuantity}
          availableQuantity={maxQuantity}
          onChange={onChange}
          size={size}
        />
      )}
      {showAvailable && (
        <div
          className={`${handles.availableQuantityContainer} mv4 c-muted-2 t-small`}>
          <FormattedMessage
            id="store/product-quantity.quantity-available"
            values={{ availableQuantity }}
          />
        </div>
      )}
    </div>
  )
}

export default BaseProductQuantity
