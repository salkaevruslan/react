import React, { useEffect, useMemo, useState } from 'react'
import useTheme from '../use-theme'
import { setChildrenProps } from '../utils/collections'
import TreeFile from './tree-file'
import Expand from '../shared/expand'
import TreeIndents from './tree-indents'
import { TreeFile as TreeFileData, makeChildren } from './tree'
import { useTreeContext } from './tree-context'
import TreeFolderIcon from './tree-folder-icon'
import TreeStatusIcon from './tree-status-icon'
import { sortChildren, makeChildPath, stopPropagation } from './tree-help'

interface Props {
  dataValue: Array<TreeFileData> | undefined,
  setClick: (click: any) => any,
  name: string
  extra?: string
  parentPath?: string
  level?: number
  className?: string
}

const defaultProps = {
  level: 0,
  className: '',
  parentPath: '',
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeFolderProps = Props & NativeAttrs

const TreeFolder: React.FC<React.PropsWithChildren<TreeFolderProps>> =({
  dataValue,
  setClick,
  name,
  parentPath,
  level: parentLevel,
  extra,
  className,
  ...props
}: React.PropsWithChildren<TreeFolderProps> & typeof defaultProps) => {
  const theme = useTheme()
  const { initialExpand, isImperative } = useTreeContext()
  const [expanded, setExpanded] = useState<boolean>(initialExpand)
  const [forceReshapeIndicator, setForceReshapeIndicator] = useState<boolean>(false)
  const [processed, setProcessed] = useState<boolean>(false)
  useEffect(() => {
    setExpanded(initialExpand)
    //console.log(currentPath)
    //console.log(parentLevel)
    if (parentLevel <= 0) {
      process()
    }
    if (setClick != undefined) {
      setClick(process)
    }
  }, [])


  const currentPath = useMemo(() => makeChildPath(name, parentPath), [])

  const [clicks, setClicks] = useState<any[]>()

  const [sortedChildren, setSortedChildren] = useState(null)

  const clickHandler = () => {
    clicks?.map(async (click) => {click()})
    setExpanded(!expanded)
  }


  const process = () => {
    if (processed)
      return
    setProcessed(true)
    let children = makeChildren(dataValue)
    setClicks(children?.clicks)
    clicks?.map((click) => (click()))
    // @ts-ignore
    let nextChildren = setChildrenProps(
      children?.values,
      {
        parentPath: currentPath,
        level: parentLevel + 1,
      },
      [TreeFolder, TreeFile],
    )
    // @ts-ignore
    setSortedChildren(isImperative
      ? nextChildren
      : sortChildren(nextChildren, TreeFolder))
    setForceReshapeIndicator(!forceReshapeIndicator)
  }

  return (
    <div className={`folder ${className}`} onClick={clickHandler} {...props}>
      <div className='names'>
        <TreeIndents count={parentLevel} />
        <span className='status'>
          <TreeStatusIcon active={expanded} />
        </span>
        <span className='icon'>
          <TreeFolderIcon />
        </span>
        <span className='name'>
          {name}
          {extra && <span className='extra'>{extra}</span>}
        </span>
      </div>
      <Expand isExpanded={expanded} forceReshapeIndicator={forceReshapeIndicator}>
        <div className='content' onClick={stopPropagation}>
          {sortedChildren}
        </div>
      </Expand>

      <style jsx>{`
        .folder {
          cursor: pointer;
          line-height: 1;
          user-select: none;
        }

        .names {
          display: flex;
          height: 1.75rem;
          align-items: center;
          margin-left: calc(1.875rem * ${parentLevel});
          position: relative;
        }

        .names > :global(.indent) {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 100%;
          background-color: ${theme.palette.accents_2};
          margin-left: -1px;
        }

        .status {
          position: absolute;
          left: calc(-1.125rem);
          top: 50%;
          transform: translate(-50%, -50%);
          width: 0.875rem;
          height: 0.875rem;
          z-index: 10;
          background-color: ${theme.palette.background};
        }

        .icon {
          width: 1.5rem;
          height: 100%;
          margin-right: 0.5rem;
        }

        .status,
        .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .name {
          transition: opacity 100ms ease 0ms;
          color: ${theme.palette.accents_8};
          white-space: nowrap;
          font-size: 0.875rem;
        }

        .extra {
          font-size: 0.75rem;
          align-self: baseline;
          padding-left: 4px;
          color: ${theme.palette.accents_5};
        }

        .name:hover {
          opacity: 0.7;
        }

        .content {
          display: flex;
          flex-direction: column;
          height: auto;
        }
      `}</style>
    </div>
  )
}

TreeFolder.defaultProps = defaultProps
TreeFolder.displayName = 'GeistTreeFolder'
export default TreeFolder
